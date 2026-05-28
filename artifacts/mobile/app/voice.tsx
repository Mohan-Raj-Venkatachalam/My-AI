import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useChat } from "@/context/ChatContext";
import VoiceOrb from "@/components/VoiceOrb";
import MessageBubble from "@/components/MessageBubble";
import { LinearGradient } from "expo-linear-gradient";

export default function VoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isStreaming, isListening, sendMessage, setIsListening, activeConversation, createConversation } =
    useChat();

  const [transcript, setTranscript] = useState("");

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const messages = activeConversation?.messages ?? [];
  const lastTwo = messages.slice(-2);

  function toggleVoice() {
    if (isListening) {
      setIsListening(false);
      if (transcript.trim()) {
        if (!activeConversation) createConversation("voice");
        sendMessage(transcript.trim());
        setTranscript("");
      }
    } else {
      setIsListening(true);
      setTranscript("Voice input active — type to simulate");
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 12,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    body: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      gap: 32,
    },
    orbSection: {
      alignItems: "center",
      gap: 16,
    },
    statusText: {
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    activeText: {
      color: colors.accent,
    },
    recentMessages: {
      width: "100%",
      gap: 4,
    },
    hintsRow: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 24,
      paddingBottom: bottomPad + 24,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    hint: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    hintText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
  });

  const HINT_PROMPTS = [
    "Debug my code",
    "Write an email",
    "Find jobs",
    "Design advice",
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart + "10", "transparent"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Voice Mode</Text>
      </View>

      <View style={styles.body}>
        {lastTwo.length > 0 && (
          <View style={styles.recentMessages}>
            {lastTwo.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} isStreaming={isStreaming && i === lastTwo.length - 1 && msg.role === "assistant"} />
            ))}
          </View>
        )}

        <View style={styles.orbSection}>
          <VoiceOrb
            isListening={isListening}
            onPress={toggleVoice}
            size={88}
          />
          <Text style={[styles.statusText, isListening && styles.activeText]}>
            {isListening ? "Listening…" : isStreaming ? "Thinking…" : "Tap to speak"}
          </Text>
        </View>
      </View>

      <View style={styles.hintsRow}>
        {HINT_PROMPTS.map((p) => (
          <TouchableOpacity
            key={p}
            style={styles.hint}
            onPress={() => {
              if (!activeConversation) createConversation("voice");
              sendMessage(p);
            }}
          >
            <Text style={styles.hintText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
