import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { useChat } from "@/context/ChatContext";
import MessageBubble from "@/components/MessageBubble";
import ChatInput from "@/components/ChatInput";
import CapabilityCard, { type Capability } from "@/components/CapabilityCard";

const CAPABILITIES: Capability[] = [
  {
    icon: "code",
    title: "Debug & write code",
    prompt: "Help me debug and write clean code",
    gradient: ["#6C63FF", "#A855F7"],
  },
  {
    icon: "edit-3",
    title: "Create content",
    prompt: "Help me write compelling content",
    gradient: ["#F59E0B", "#EF4444"],
  },
  {
    icon: "mail",
    title: "Draft an email",
    prompt: "Help me write a professional email",
    gradient: ["#10B981", "#059669"],
  },
  {
    icon: "briefcase",
    title: "Find jobs",
    prompt: "Help me find relevant jobs and optimize my resume",
    gradient: ["#3B82F6", "#1D4ED8"],
  },
  {
    icon: "image",
    title: "Image creation",
    prompt: "Help me create an image with the perfect AI prompt",
    gradient: ["#EC4899", "#A855F7"],
  },
  {
    icon: "layout",
    title: "UI/UX design",
    prompt: "Help me design a great user experience",
    gradient: ["#F97316", "#EC4899"],
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    activeConversation,
    createConversation,
    isStreaming,
    isListening,
    sendMessage,
    setActiveConversation,
    clearMessages,
    setIsListening,
  } = useChat();

  const flatListRef = useRef<FlatList>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messages = activeConversation?.messages ?? [];
  const isEmpty = messages.length === 0;

  function handleSend(text: string, imageUri?: string, imageBase64?: string) {
    if (!activeConversation) {
      createConversation("text");
    }
    sendMessage(text, imageUri, imageBase64);
  }

  function handleCapability(prompt: string) {
    if (!activeConversation) createConversation("text");
    sendMessage(prompt);
  }

  const topPad =
    Platform.OS === "web"
      ? Math.max(insets.top, 67)
      : insets.top;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
      gap: 10,
      borderBottomWidth: isEmpty ? 0 : 1,
      borderBottomColor: colors.border,
    },
    menuBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    titleWrap: {
      flex: 1,
    },
    appName: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    statusDot: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#22C55E",
    },
    statusText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    clearBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      gap: 8,
    },
    greeting: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      fontFamily: "Inter_400Regular",
      marginBottom: 16,
    },
    cardsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "center",
      width: "100%",
      maxWidth: 400,
    },
    gradientText: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
    },
    messageList: {
      flex: 1,
    },
    messageContent: {
      paddingVertical: 8,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setSidebarOpen(true)}>
          <Feather name="menu" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.appName}>My AI</Text>
          <View style={styles.statusDot}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        {!isEmpty && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearMessages}>
            <Feather name="refresh-ccw" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => createConversation("text")}
        >
          <Feather name="plus" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 8 }}
          >
            <Text
              style={[styles.gradientText, { color: "transparent" }]}
            >
            </Text>
          </LinearGradient>
          <Text style={styles.greeting}>How can I help you?</Text>
          <Text style={styles.subtitle}>
            Your AI for coding, content, jobs, design & more
          </Text>
          <View style={styles.cardsWrap}>
            {CAPABILITIES.map((cap) => (
              <CapabilityCard
                key={cap.title}
                capability={cap}
                onPress={handleCapability}
              />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          inverted
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!messages.length}
          renderItem={({ item, index }) => (
            <MessageBubble
              message={item}
              isStreaming={isStreaming && index === 0 && item.role === "assistant"}
            />
          )}
        />
      )}

      <ChatInput
        onSend={handleSend}
        onVoiceStart={() => setIsListening(true)}
        onVoiceStop={() => setIsListening(false)}
        isStreaming={isStreaming}
        isListening={isListening}
      />

      {sidebarOpen && (
        <SidebarOverlay
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

function SidebarOverlay({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const { conversations, activeConversation, setActiveConversation, createConversation, deleteConversation } = useChat();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { flexDirection: "row", backgroundColor: "transparent" },
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "#00000060" }}
        onPress={onClose}
        activeOpacity={1}
      />
      <View
        style={{
          width: 280,
          backgroundColor: colors.background,
          paddingTop: topPad,
          borderLeftWidth: 1,
          borderLeftColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_700Bold",
              color: colors.foreground,
            }}
          >
            Conversations
          </Text>
          <TouchableOpacity
            onPress={() => {
              createConversation("text");
              onClose();
            }}
          >
            <Feather name="plus" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isActive = item.id === activeConversation?.id;
            return (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: isActive ? colors.surfaceGlow : "transparent",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  gap: 10,
                }}
                onPress={() => {
                  setActiveConversation(item.id);
                  onClose();
                }}
              >
                <Feather
                  name="message-square"
                  size={15}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: colors.foreground,
                    fontFamily: "Inter_400Regular",
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => deleteConversation(item.id)}>
                  <Feather name="trash-2" size={13} color={colors.mutedForeground} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}
