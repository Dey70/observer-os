import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { saveSession } from "../database/database";

const SESSION_TYPES = ["Run", "Lift", "Study"];

export default function SessionLogger() {
  const [selectedType, setSelectedType] = useState("Run");
  const [duration, setDuration] = useState("");
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState("");
  const [distance, setDistance] = useState("");
  const [exercises, setExercises] = useState("");
  const [topic, setTopic] = useState("");
  const [focusQuality, setFocusQuality] = useState(7);

  const handleSave = () => {
    if (!duration) {
      Alert.alert("Missing", "Please enter a duration.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const sessionNotes =
      selectedType === "Run"
        ? `Distance: ${distance}km. ${notes}`
        : selectedType === "Lift"
          ? `Exercises: ${exercises}. ${notes}`
          : `Topic: ${topic}. ${notes}`;

    const data = {
      date: today,
      type: selectedType,
      duration: parseInt(duration),
      notes: sessionNotes,
      rpe: selectedType === "Study" ? focusQuality : rpe,
    };

    saveSession(data, (success) => {
      if (success) {
        Alert.alert(
          "Session Logged ✓",
          `${selectedType} — ${duration} mins saved.`,
        );
        setDuration("");
        setNotes("");
        setDistance("");
        setExercises("");
        setTopic("");
        setRpe(7);
        setFocusQuality(7);
      } else {
        Alert.alert("Error", "Could not save. Try again.");
      }
    });
  };

  const RpeSelector = ({ value, setValue, label }) => (
    <View style={styles.rpeContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.rpeValue}>{value}/10</Text>
      </View>
      <View style={styles.dotsContainer}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <TouchableOpacity
            key={num}
            onPress={() => setValue(num)}
            style={[
              styles.dot,
              num <= value && styles.dotActive,
              num === value && styles.dotSelected,
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Log Session</Text>
      <Text style={styles.date}>{new Date().toDateString()}</Text>

      <View style={styles.typeRow}>
        {SESSION_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type && styles.typeButtonTextActive,
              ]}
            >
              {type === "Run"
                ? "🏃 Run"
                : type === "Lift"
                  ? "🏋️ Lift"
                  : "📚 Study"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="45"
          placeholderTextColor="#444"
        />
      </View>

      {selectedType === "Run" && (
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Distance (km)</Text>
          <TextInput
            style={styles.input}
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
            placeholder="5.0"
            placeholderTextColor="#444"
          />
          <RpeSelector value={rpe} setValue={setRpe} label="Effort (RPE)" />
        </View>
      )}

      {selectedType === "Lift" && (
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Exercises</Text>
          <TextInput
            style={styles.textArea}
            value={exercises}
            onChangeText={setExercises}
            placeholder="e.g. Squat 3x5, Bench 4x8..."
            placeholderTextColor="#444"
            multiline
            numberOfLines={3}
          />
          <RpeSelector value={rpe} setValue={setRpe} label="Effort (RPE)" />
        </View>
      )}

      {selectedType === "Study" && (
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Topic / Subject</Text>
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. NLP, LLM fine-tuning..."
            placeholderTextColor="#444"
          />
          <RpeSelector
            value={focusQuality}
            setValue={setFocusQuality}
            label="Focus Quality"
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.textArea}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it go?"
          placeholderTextColor="#444"
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, paddingBottom: 40 },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
  },
  date: { fontSize: 13, color: "#555", marginTop: 4, marginBottom: 24 },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#141414",
    alignItems: "center",
  },
  typeButtonActive: { backgroundColor: "#ffffff" },
  typeButtonText: { color: "#555", fontSize: 13, fontWeight: "600" },
  typeButtonTextActive: { color: "#000000" },
  card: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  textArea: { fontSize: 15, color: "#ffffff", lineHeight: 22, marginBottom: 8 },
  rpeContainer: { marginTop: 12 },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rpeValue: { fontSize: 15, color: "#ffffff", fontWeight: "bold" },
  dotsContainer: { flexDirection: "row", justifyContent: "space-between" },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#222" },
  dotActive: { backgroundColor: "#333" },
  dotSelected: { backgroundColor: "#ffffff" },
  saveButton: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: "bold", color: "#000000" },
});
