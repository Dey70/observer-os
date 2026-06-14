import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { askCoach } from "../ai/coach";
import { getRecentLogs, getRecentSessions } from "../database/database";

const isSunday = () => new Date().getDay() === 0;

const getWeekKey = () => {
  const d = new Date();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  return sunday.toISOString().split("T")[0];
};

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I'm Observer, your personal performance coach. I have access to your training and recovery data. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const scrollRef = useRef(null);
  const weeklyReviewDone = useRef(false);

  useFocusEffect(
    useCallback(() => {
      getRecentLogs(14, (logs) => {
        setRecentLogs(logs);
        getRecentSessions(14, (sessions) => {
          setRecentSessions(sessions);

          // Auto weekly review on Sundays
          if (isSunday() && !weeklyReviewDone.current) {
            weeklyReviewDone.current = true;
            const weekKey = getWeekKey();
            const storageKey = `weekly_review_${weekKey}`;

            // Check if already generated this week
            const alreadyDone = global[storageKey];
            if (!alreadyDone) {
              global[storageKey] = true;
              setTimeout(() => generateWeeklyReview(logs, sessions), 1000);
            }
          }
        });
      });
    }, []),
  );

  const generateWeeklyReview = async (logs, sessions) => {
    const weeklyMessage =
      "Generate my weekly performance review. Summarize: what improved, what declined, patterns you noticed, and one key adjustment for next week. Be specific and use my actual data.";

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "📊 **Weekly Review — " +
          new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }) +
          "**\n\nGenerating your weekly summary...",
      },
    ]);

    setLoading(true);
    try {
      const reply = await askCoach(weeklyMessage, logs, sessions);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "📊 **Weekly Review**\n\n" + reply,
        };
        return updated;
      });
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Could not generate weekly review. Try asking manually.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const reply = await askCoach(userMessage, recentLogs, recentSessions);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong. Check your API key or internet connection.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const QUICK_PROMPTS = [
    "How is my recovery?",
    "Should I train hard today?",
    "What patterns do you see?",
    "Give me my weekly review",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>AI Coach</Text>
        <View style={styles.onlineDot} />
        {isSunday() && (
          <Text style={styles.sundayBadge}>📊 Weekly Review Day</Text>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              msg.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                msg.role === "user" ? styles.userText : styles.assistantText,
              ]}
            >
              {msg.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={styles.assistantBubble}>
            <ActivityIndicator size="small" color="#666" />
          </View>
        )}
      </ScrollView>

      <View style={styles.quickPromptsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {QUICK_PROMPTS.map((prompt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickPrompt}
              onPress={() => setInput(prompt)}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask your coach..."
          placeholderTextColor="#444"
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || loading) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  heading: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6ee7b7",
    marginLeft: 8,
  },
  sundayBadge: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#fcd34d",
    fontWeight: "600",
  },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: "85%", borderRadius: 18, padding: 14, marginBottom: 10 },
  userBubble: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#141414",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: "#000000" },
  assistantText: { color: "#ffffff" },
  quickPromptsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  quickPrompt: {
    backgroundColor: "#141414",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  quickPromptText: { color: "#888", fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#141414",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { backgroundColor: "#1a1a1a" },
  sendButtonText: { fontSize: 18, fontWeight: "bold", color: "#000000" },
});
