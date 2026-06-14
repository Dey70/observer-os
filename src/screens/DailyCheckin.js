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
import { saveDailyLog } from "../database/database";

const SliderRow = ({ label, value, setValue, min = 1, max = 10 }) => {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}/10</Text>
      </View>
      <View style={styles.dotsContainer}>
        {Array.from({ length: max }, (_, i) => i + 1).map((num) => (
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
};

export default function DailyCheckin() {
  const [sleepHours, setSleepHours] = useState("7");
  const [sleepQuality, setSleepQuality] = useState(7);
  const [soreness, setSoreness] = useState(3);
  const [fatigue, setFatigue] = useState(3);
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    const data = {
      date: today,
      sleepHours: parseFloat(sleepHours),
      sleepQuality,
      soreness,
      fatigue,
      mood,
      energy,
      notes,
    };

    saveDailyLog(data, (success) => {
      if (success) {
        setSaved(true);
        Alert.alert("Logged", "Your check-in has been saved.");
      } else {
        Alert.alert("Error", "Something went wrong. Try again.");
      }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Morning Check-in</Text>
      <Text style={styles.date}>{new Date().toDateString()}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Sleep Duration</Text>
        <View style={styles.sleepInputRow}>
          <TextInput
            style={styles.sleepInput}
            value={sleepHours}
            onChangeText={setSleepHours}
            keyboardType="decimal-pad"
            placeholderTextColor="#444"
          />
          <Text style={styles.sleepUnit}>hours</Text>
        </View>
      </View>

      <View style={styles.card}>
        <SliderRow
          label="Sleep Quality"
          value={sleepQuality}
          setValue={setSleepQuality}
        />
        <SliderRow label="Mood" value={mood} setValue={setMood} />
        <SliderRow label="Energy" value={energy} setValue={setEnergy} />
        <SliderRow label="Soreness" value={soreness} setValue={setSoreness} />
        <SliderRow label="Fatigue" value={fatigue} setValue={setFatigue} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="How are you feeling today?"
          placeholderTextColor="#444"
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saved && styles.saveButtonDone]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          {saved ? "✓ Saved" : "Save Check-in"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
  },
  date: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sleepInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sleepInput: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
    width: 80,
  },
  sleepUnit: {
    fontSize: 16,
    color: "#555",
    marginLeft: 8,
  },
  sliderRow: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 15,
    color: "#cccccc",
  },
  sliderValue: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "bold",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#222",
  },
  dotActive: {
    backgroundColor: "#333",
  },
  dotSelected: {
    backgroundColor: "#ffffff",
  },
  notesInput: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDone: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
});
