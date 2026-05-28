import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetch as expoFetch } from "expo/fetch";
import { Platform } from "react-native";
import { getApiUrl } from "@/lib/query-client";

const fetchFn: typeof globalThis.fetch =
  Platform.OS === "web" ? globalThis.fetch : (expoFetch as unknown as typeof globalThis.fetch);

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  imageUri?: string;
  imageBase64?: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  mode: "text" | "voice";
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ChatContextValue {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isStreaming: boolean;
  isListening: boolean;
  setActiveConversation: (id: string | null) => void;
  createConversation: (mode?: "text" | "voice") => Conversation;
  deleteConversation: (id: string) => void;
  sendMessage: (content: string, imageUri?: string, imageBase64?: string) => Promise<void>;
  sendVoiceMessage: (audioBlob: Blob) => Promise<void>;
  clearMessages: () => void;
  setIsListening: (v: boolean) => void;
}

const STORAGE_KEY = "ai_assistant_conversations";

const SYSTEM_PROMPT = `You are a highly capable personal AI assistant with deep expertise in:
- Software development and coding (all languages, frameworks, debugging, architecture)
- Content creation (writing, copywriting, blog posts, social media, scripts)
- Email drafting and professional communication
- Job searching across all platforms (LinkedIn, Indeed, Glassdoor, remote job boards)
- Voice assistance and natural conversation
- Image creation prompting and AI art direction
- UI/UX design principles, user research, wireframing, prototyping
- Web and mobile application development

Be direct, helpful, and expert-level in your responses. Tailor your tone to the task — technical for coding, creative for content, professional for emails. Always provide actionable, specific guidance.`;

const ChatContext = createContext<ChatContextValue | null>(null);

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        setConversations(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      }
    } catch {}
  }

  async function saveConversations(convos: Conversation[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
    } catch {}
  }

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  const createConversation = useCallback(
    (mode: "text" | "voice" = "text"): Conversation => {
      const conv: Conversation = {
        id: generateId(),
        title: "New conversation",
        mode,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => {
        const next = [conv, ...prev];
        saveConversations(next);
        return next;
      });
      setActiveId(conv.id);
      return conv;
    },
    []
  );

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConversations(next);
      return next;
    });
    setActiveId((prev) => {
      if (prev === id) return null;
      return prev;
    });
  }, []);

  const clearMessages = useCallback(() => {
    if (!activeId) return;
    setConversations((prev) => {
      const next = prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [], updatedAt: Date.now() }
          : c
      );
      saveConversations(next);
      return next;
    });
  }, [activeId]);

  const sendMessage = useCallback(
    async (content: string, imageUri?: string, imageBase64?: string) => {
      let targetId = activeId;
      if (!targetId) {
        const conv = createConversation("text");
        targetId = conv.id;
      }

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        imageUri,
        imageBase64,
        timestamp: Date.now(),
      };

      let currentMessages: ChatMessage[] = [];
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== targetId) return c;
          const msgs = [...c.messages, userMsg];
          currentMessages = msgs;
          const titleText = content || "📎 Image";
          const title =
            c.messages.length === 0
              ? titleText.slice(0, 40) + (titleText.length > 40 ? "…" : "")
              : c.title;
          return { ...c, messages: msgs, title, updatedAt: Date.now() };
        });
        saveConversations(updated);
        return updated;
      });

      setIsStreaming(true);

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        type ApiContent =
          | string
          | { type: "text"; text: string }[]
          | { type: "text" | "image_url"; text?: string; image_url?: { url: string } }[];

        const apiMessages: { role: "system" | "user" | "assistant"; content: ApiContent }[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...currentMessages.map((m) => {
            if (m.imageBase64 && m.role === "user") {
              const parts: { type: "text" | "image_url"; text?: string; image_url?: { url: string } }[] = [];
              if (m.content) parts.push({ type: "text", text: m.content });
              parts.push({
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${m.imageBase64}` },
              });
              return { role: "user" as const, content: parts };
            }
            return { role: m.role as "user" | "assistant", content: m.content };
          }),
        ];

        const url = `${getApiUrl()}api/ai/chat`;
        console.log("[AI] fetching", url);
        const response = await fetchFn(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ messages: apiMessages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          console.error("[AI] response not ok", response.status, body);
          throw new Error(`API error ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No body");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                const snapshot = fullContent;
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== targetId) return c;
                    const msgs = c.messages.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: snapshot }
                        : m
                    );
                    return { ...c, messages: msgs };
                  })
                );
              }
            } catch {}
          }
        }

        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== targetId) return c;
            const msgs = c.messages.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: fullContent } : m
            );
            return { ...c, messages: msgs, updatedAt: Date.now() };
          });
          saveConversations(updated);
          return updated;
        });
      } catch (err: unknown) {
        const isAbort =
          err instanceof Error && err.name === "AbortError";
        if (!isAbort) {
          console.error("[AI] sendMessage error", err);
          const errMsg = "Sorry, I couldn't connect to the AI. Please check your connection and try again.";
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetId) return c;
              const msgs = c.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: errMsg } : m
              );
              return { ...c, messages: msgs };
            })
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeId, createConversation]
  );

  const sendVoiceMessage = useCallback(
    async (_audioBlob: Blob) => {
      await sendMessage("[Voice message — transcription coming soon]");
    },
    [sendMessage]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        isStreaming,
        isListening,
        setActiveConversation,
        createConversation,
        deleteConversation,
        sendMessage,
        sendVoiceMessage,
        clearMessages,
        setIsListening,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
