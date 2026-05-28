import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

export interface Capability {
  icon: string;
  title: string;
  prompt: string;
  gradient: [string, string];
}

interface Props {
  capability: Capability;
  onPress: (prompt: string) => void;
}

export default function CapabilityCard({ capability, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={() => onPress(capability.prompt)}
      activeOpacity={0.75}
      style={styles.touch}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <LinearGradient
          colors={capability.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrap}
        >
          <Feather name={capability.icon as any} size={20} color="#fff" />
        </LinearGradient>
        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: "Inter_500Medium" },
          ]}
          numberOfLines={2}
        >
          {capability.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    flex: 1,
    minWidth: "47%",
    maxWidth: "47%",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
  },
});
