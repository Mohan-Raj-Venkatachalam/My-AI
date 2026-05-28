import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

interface RowProps {
  icon: string;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  toggle,
  toggleValue,
  onToggle,
  onPress,
  danger,
}: RowProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[styles.rowIcon, { backgroundColor: danger ? colors.destructive + "22" : colors.surfaceGlow }]}
      >
        <Feather
          name={icon as any}
          size={17}
          color={danger ? colors.destructive : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.rowLabel,
          {
            color: danger ? colors.destructive : colors.foreground,
            fontFamily: "Inter_400Regular",
          },
        ]}
      >
        {label}
      </Text>
      <View style={{ flex: 1 }} />
      {value && (
        <Text
          style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}
        >
          {value}
        </Text>
      )}
      {toggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.muted, true: colors.primary }}
          thumbColor="#fff"
        />
      )}
      {onPress && !toggle && (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
  },
});

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [haptics, setHaptics] = React.useState(true);
  const [streaming, setStreaming] = React.useState(true);
  const [voiceOutput, setVoiceOutput] = React.useState(false);

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: topPad + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 17,
            fontFamily: "Inter_700Bold",
            color: colors.foreground,
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 20 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 }}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="cpu" size={24} color="#fff" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_700Bold",
                  color: "#fff",
                }}
              >
                My AI Assistant
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "Inter_400Regular",
                  marginTop: 2,
                }}
              >
                Powered by GPT-5 · Always learning
              </Text>
            </View>
          </LinearGradient>
        </View>

        <SectionHeader title="AI Model" colors={colors} />
        <SettingsRow icon="zap" label="Model" value="GPT-5" />
        <SettingsRow
          icon="activity"
          label="Streaming responses"
          toggle
          toggleValue={streaming}
          onToggle={setStreaming}
        />

        <SectionHeader title="Voice" colors={colors} />
        <SettingsRow
          icon="volume-2"
          label="Voice output"
          toggle
          toggleValue={voiceOutput}
          onToggle={setVoiceOutput}
        />
        <SettingsRow icon="mic" label="Voice" value="Alloy" onPress={() => {}} />

        <SectionHeader title="Capabilities" colors={colors} />
        <SettingsRow icon="code" label="Coding" value="Enabled" />
        <SettingsRow icon="edit-3" label="Content creation" value="Enabled" />
        <SettingsRow icon="mail" label="Email drafting" value="Enabled" />
        <SettingsRow icon="briefcase" label="Job finding" value="Enabled" />
        <SettingsRow icon="image" label="Image prompting" value="Enabled" />
        <SettingsRow icon="layout" label="UI/UX design" value="Enabled" />

        <SectionHeader title="Preferences" colors={colors} />
        <SettingsRow
          icon="zap"
          label="Haptic feedback"
          toggle
          toggleValue={haptics}
          onToggle={setHaptics}
        />

        <SectionHeader title="About" colors={colors} />
        <SettingsRow icon="info" label="Version" value="1.0.0" />
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 }}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_600SemiBold",
          color: colors.mutedForeground,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
