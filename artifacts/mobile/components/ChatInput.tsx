import React, { useState, useRef } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "@/hooks/useColors";

interface Props {
  onSend: (text: string, imageUri?: string, imageBase64?: string) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  isStreaming?: boolean;
  isListening?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onVoiceStart,
  onVoiceStop,
  isStreaming,
  isListening,
  disabled,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [attachedImage, setAttachedImage] = useState<{
    uri: string;
    base64: string;
  } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  React.useEffect(() => {
    if (isListening) {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      );
      pulseRef.current.start();
    } else {
      pulseRef.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  async function handlePickImage() {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachedImage({
        uri: asset.uri,
        base64: asset.base64 ?? "",
      });
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }

  function removeImage() {
    setAttachedImage(null);
  }

  async function handleSend() {
    const trimmed = text.trim();
    if ((!trimmed && !attachedImage) || isStreaming) return;
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSend(trimmed, attachedImage?.uri, attachedImage?.base64);
    setText("");
    setAttachedImage(null);
  }

  async function handleVoice() {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isListening) {
      onVoiceStop?.();
    } else {
      onVoiceStart?.();
    }
  }

  const bottomPad =
    Platform.OS === "web"
      ? Math.max(insets.bottom, 34)
      : Math.max(insets.bottom, 8);

  const canSend = (text.trim().length > 0 || !!attachedImage) && !isStreaming && !disabled;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
        },
      ]}
    >
      {attachedImage && (
        <View style={styles.previewRow}>
          <View style={[styles.previewWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Image source={{ uri: attachedImage.uri }} style={styles.previewImg} />
            <TouchableOpacity
              style={[styles.removeBtn, { backgroundColor: colors.destructive }]}
              onPress={removeImage}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather name="x" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.row}>
        {/* Mic button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: isListening ? colors.accent : colors.secondary,
                borderColor: isListening ? colors.accent : colors.border,
              },
            ]}
            onPress={handleVoice}
          >
            <Feather
              name={isListening ? "mic-off" : "mic"}
              size={20}
              color={isListening ? "#fff" : colors.secondaryForeground}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Upload button */}
        <TouchableOpacity
          style={[
            styles.iconBtn,
            {
              backgroundColor: attachedImage ? colors.primary + "33" : colors.secondary,
              borderColor: attachedImage ? colors.primary : colors.border,
            },
          ]}
          onPress={handlePickImage}
          disabled={isStreaming}
        >
          <Feather
            name="paperclip"
            size={20}
            color={attachedImage ? colors.primary : colors.secondaryForeground}
          />
        </TouchableOpacity>

        {/* Text input */}
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            value={text}
            onChangeText={setText}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            editable={!isStreaming && !disabled}
          />
        </View>

        {/* Send button */}
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: canSend ? colors.primary : colors.secondary },
          ]}
          onPress={handleSend}
          disabled={!canSend}
        >
          {isStreaming ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="arrow-up" size={20} color={canSend ? "#fff" : colors.mutedForeground} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  previewRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  previewWrap: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  previewImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  removeBtn: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
