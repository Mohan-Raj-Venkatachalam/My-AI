import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { ChatMessage } from "@/context/ChatContext";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const colors = useColors();
  const isUser = message.role === "user";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  async function handleCopy() {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          flexDirection: isUser ? "row-reverse" : "row",
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: isUser ? colors.primary : colors.accent,
          },
        ]}
      >
        <Feather name={isUser ? "user" : "cpu"} size={14} color="#fff" />
      </View>

      <View style={{ maxWidth: "78%" }}>
        {/* Image attachment */}
        {message.imageUri ? (
          <View
            style={[
              styles.imageBubble,
              {
                borderColor: colors.border,
                borderBottomRightRadius: isUser ? 4 : 12,
                borderBottomLeftRadius: isUser ? 12 : 4,
              },
            ]}
          >
            <Image
              source={{ uri: message.imageUri }}
              style={styles.attachedImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* Text bubble */}
        {message.content.length > 0 && (
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: isUser ? colors.primary : colors.card,
                borderRadius: 18,
                borderBottomRightRadius: isUser ? 4 : 18,
                borderBottomLeftRadius: isUser ? 18 : 4,
                marginTop: message.imageUri ? 4 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: isUser ? colors.primaryForeground : colors.foreground,
                },
              ]}
            >
              {message.content}
              {isStreaming && !isUser && (
                <Text style={{ color: colors.primary }}>▌</Text>
              )}
            </Text>
          </View>
        )}

        {/* Copy button for assistant */}
        {!isUser && message.content.length > 0 && !isStreaming && (
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Feather name="copy" size={13} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-end",
    marginVertical: 4,
    paddingHorizontal: 12,
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  imageBubble: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  attachedImage: {
    width: 200,
    height: 150,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  copyBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    padding: 2,
  },
});
