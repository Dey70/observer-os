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

const EFFORT_LEVELS = [
  { label: "Easy", value: 3, color: "#6ee7b7" },
  { label: "Medium", value: 5, color: "#fcd34d" },
  { label: "Hard", value: 7, color: "#f97316" },
  { label: "Very Hard", value: 9, color: "#ef4444" },
];

export default function SessionLogger() {
  const [selectedType, setSelectedType] = useState("Run");
  const [durationHours, setDurationHours] = useState("0");
  const [durationMins, setDurationMins] = useState("");
  const [effort, setEffort] = useState(null);
  const [notes, setNotes] = useState("");
  const [distance, setDistance] = useState("");
  const [terrain, setTerrain] = useState("Road");
  const [exercises, setExercises] = useState("");
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [topic, setTopic] = useState("");
  const [focusEffort, setFocusEffort] = useState(null);

  const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
  const TERRAIN_TYPES = ["Road", "Trail", "Track", "Treadmill"];

  const toggleMuscleGroup = (group) => {
    setMuscleGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  };

  const handleSave = () => {
    const totalMinutes =
      (parseInt(durationHours) || 0) * 60 + (parseInt(durationMins) || 0);

    if (totalMinutes === 0) {
      Alert.alert("Missing", "Please enter a duration.");
      return;
    }

    const selectedEffort = selectedType === "Study" ? focusEffort : effort;
    if (!selectedEffort) {
      Alert.alert("Missing", "Please select an effort level.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    let sessionNotes = "";
    if (selectedType === "Run") {
      sessionNotes = `Distance: ${distance}km. Terrain: ${terrain}. ${notes}`;
    } else if (selectedType === "Lift") {
      sessionNotes = `Exercises: ${exercises}. Muscles: ${muscleGroups.join(", ")}. ${notes}`;
    } else {
      sessionNotes = `Topic: ${topic}. ${notes}`;
    }

    const data = {
      date: today,
      type: selectedType,
      duration: totalMinutes,
      notes: sessionNotes,
      rpe: selectedEffort.value,
    };

    saveSession(data, (success) => {
      if (success) {
        const hrs = parseInt(durationHours) || 0;
        const mins = parseInt(durationMins) || 0;
        const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
        Alert.alert(
          "Session Logged ✓",
          `${selectedType} — ${durationStr} — ${selectedEffort.label}`,
        );
        setDurationHours("0");
        setDurationMins("");
        setEffort(null);
        setFocusEffort(null);
        setNotes("");
        setDistance("");
        setExercises("");
        setTopic("");
        setMuscleGroups([]);
        setTerrain("Road");
      } else {
        Alert.alert("Error", "Could not save. Try again.");
      }
    });
  };

  const EffortSelector = ({ value, setValue }) => (
    <View style={styles.effortContainer}>
      <Text style={styles.fieldLabel}>Effort</Text>
      <View style={styles.effortRow}>
        {EFFORT_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.label}
            onPress={() => setValue(level)}
            style={[
              styles.effortButton,
              value?.label === level.label && { backgroundColor: level.color },
            ]}
          >
            <Text
              style={[
                styles.effortText,
                value?.label === level.label && { color: "#000000" },
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Log Session</Text>
      <Text style={styles.date}>{new Date().toDateString()}</Text>

      {/* Session Type */}
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

      {/* Duration */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Duration</Text>
        <View style={styles.durationRow}>
          <View style={styles.durationField}>
            <TextInput
              style={styles.durationInput}
              value={durationHours}
              onChangeText={setDurationHours}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#444"
            />
            <Text style={styles.durationUnit}>hrs</Text>
          </View>
          <Text style={styles.durationSeparator}>:</Text>
          <View style={styles.durationField}>
            <TextInput
              style={styles.durationInput}
              value={durationMins}
              onChangeText={setDurationMins}
              keyboardType="numeric"
              placeholder="45"
              placeholderTextColor="#444"
            />
            <Text style={styles.durationUnit}>min</Text>
          </View>
        </View>
      </View>

      {/* Run Fields */}
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
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Terrain</Text>
          <View style={styles.chipRow}>
            {TERRAIN_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTerrain(t)}
                style={[styles.chip, terrain === t && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    terrain === t && styles.chipTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <EffortSelector value={effort} setValue={setEffort} />
        </View>
      )}

      {/* Lift Fields */}
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
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
            Muscle Groups
          </Text>
          <View style={styles.chipRow}>
            {MUSCLE_GROUPS.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => toggleMuscleGroup(g)}
                style={[
                  styles.chip,
                  muscleGroups.includes(g) && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    muscleGroups.includes(g) && styles.chipTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <EffortSelector value={effort} setValue={setEffort} />
        </View>
      )}

      {/* Study Fields */}
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
          <EffortSelector value={focusEffort} setValue={setFocusEffort} />
        </View>
      )}

      {/* Notes */}
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  textArea: { fontSize: 15, color: "#ffffff", lineHeight: 22, marginBottom: 8 },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  durationField: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  durationInput: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    minWidth: 60,
  },
  durationUnit: { fontSize: 16, color: "#555", marginBottom: 6 },
  durationSeparator: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  effortContainer: { marginTop: 16 },
  effortRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  effortButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#222",
  },
  effortText: { color: "#888", fontSize: 13, fontWeight: "600" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#222",
  },
  chipActive: { backgroundColor: "#ffffff" },
  chipText: { color: "#666", fontSize: 13 },
  chipTextActive: { color: "#000000" },
  sleepUnit: { fontSize: 16, color: "#555" },
  saveButton: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: "bold", color: "#000000" },
});
