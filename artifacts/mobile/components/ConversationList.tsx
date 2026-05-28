import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useChat, type Conversation } from "@/context/ChatContext";

interface Props {
  onSelect: (id: string) => void;
}

export default function ConversationList({ onSelect }: Props) {
  const colors = useColors();
  const { conversations, activeConversation, createConversation, deleteConversation } =
    useChat();

  function handleNew() {
    const conv = createConversation("text");
    onSelect(conv.id);
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    newBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    itemActive: {
      backgroundColor: colors.surfaceGlow,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },
    itemMeta: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    deleteBtn: {
      padding: 6,
    },
    emptyWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
      gap: 12,
    },
    emptyText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
  });

  function renderItem({ item }: { item: Conversation }) {
    const isActive = item.id === activeConversation?.id;
    const count = item.messages.length;
    const date = new Date(item.updatedAt);
    const timeStr = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    return (
      <TouchableOpacity
        style={[styles.item, isActive && styles.itemActive]}
        onPress={() => onSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrap}>
          <Feather
            name={item.mode === "voice" ? "mic" : "message-square"}
            size={16}
            color={isActive ? colors.primary : colors.mutedForeground}
          />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.itemMeta}>
            {count} message{count !== 1 ? "s" : ""} · {timeStr}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteConversation(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="trash-2" size={15} color={colors.mutedForeground} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversations</Text>
        <TouchableOpacity style={styles.newBtn} onPress={handleNew}>
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      {conversations.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Feather name="message-circle" size={40} color={colors.border} />
          <Text style={styles.emptyText}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={!!conversations.length}
        />
      )}
    </View>
  );
}
