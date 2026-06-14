import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getRecentLogs,
  getRecentSessions,
  getRecentWeights,
  saveWeight,
} from "../database/database";

const { width } = Dimensions.get("window");
const BAR_WIDTH = (width - 80) / 14;

const BarChart = ({ data, label, color, fixedMin, fixedMax }) => {
  const values = data.map((d) => d.value).filter((v) => v > 0);

  let min = 0;
  let max = 1;

  if (values.length > 0) {
    const dataMax = Math.max(...values);
    const dataMin = Math.min(...values);

    if (fixedMin !== undefined && fixedMax !== undefined) {
      if (values.length === 1) {
        min = values[0] - 10;
        max = values[0] + 10;
      } else {
        const spread = Math.max(dataMax - dataMin, 2);
        min = dataMin - spread * 0.5;
        max = dataMax + spread * 0.5;
      }
    } else {
      min = 0;
      max = Math.max(dataMax, 1);
    }
  }

  const range = Math.max(max - min, 1);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.barsRow}>
        {data.map((d, i) => (
          <View key={i} style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height:
                    d.value > 0
                      ? Math.max(((d.value - min) / range) * 80, 4)
                      : 4,
                  backgroundColor: d.value > 0 ? color : "#1a1a1a",
                  width: BAR_WIDTH - 2,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.barLabels}>
        <Text style={styles.barLabelText}>14 days ago</Text>
        <Text style={styles.barLabelText}>Today</Text>
      </View>
    </View>
  );
};

const StatCard = ({ label, value, unit, color }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>
      <Text style={{ color }}>{value}</Text>
      <Text style={styles.statUnit}> {unit}</Text>
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [weights, setWeights] = useState([]);
  const [weightInput, setWeightInput] = useState("");

  useFocusEffect(
    useCallback(() => {
      getRecentLogs(14, setLogs);
      getRecentSessions(14, setSessions);
      getRecentWeights(14, setWeights);
    }, []),
  );

  const handleSaveWeight = () => {
    const w = parseFloat(weightInput);
    if (!w || w < 30 || w > 300) {
      Alert.alert("Invalid", "Please enter a valid weight in kg.");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    saveWeight({ date: today, weight: w }, (success) => {
      if (success) {
        setWeightInput("");
        getRecentWeights(14, setWeights);
        Alert.alert("Saved", `Weight logged: ${w} kg`);
      }
    });
  };

  const getLast14Days = () => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const days = getLast14Days();

  const buildChartData = (field) =>
    days.map((date) => {
      const log = logs.find((l) => l.date === date);
      return { date, value: log ? log[field] : 0 };
    });

  const buildSessionData = () =>
    days.map((date) => {
      const daySessions = sessions.filter((s) => s.date === date);
      return { date, value: daySessions.length > 0 ? 1 : 0 };
    });

  const buildWeightData = () =>
    days.map((date) => {
      const w = weights.find((w) => w.date === date);
      return { date, value: w ? w.weight : 0 };
    });

  const avgSleep = logs.length
    ? (
        logs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / logs.length
      ).toFixed(1)
    : "—";

  const avgMood = logs.length
    ? (logs.reduce((s, l) => s + (l.mood || 0), 0) / logs.length).toFixed(1)
    : "—";

  const avgEnergy = logs.length
    ? (logs.reduce((s, l) => s + (l.energy || 0), 0) / logs.length).toFixed(1)
    : "—";

  const avgWeight = weights.length
    ? (weights.reduce((s, w) => s + w.weight, 0) / weights.length).toFixed(1)
    : "—";

  const latestWeight = weights.length > 0 ? weights[0].weight : null;

  const totalSessions = sessions.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Dashboard</Text>
      <Text style={styles.subtitle}>Last 14 days</Text>

      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptyText}>
            Complete your morning check-in to start seeing trends here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard
              label="Avg Sleep"
              value={avgSleep}
              unit="hrs"
              color="#6ee7b7"
            />
            <StatCard
              label="Avg Mood"
              value={avgMood}
              unit="/10"
              color="#93c5fd"
            />
            <StatCard
              label="Avg Energy"
              value={avgEnergy}
              unit="/10"
              color="#fcd34d"
            />
            <StatCard
              label="Sessions"
              value={totalSessions}
              unit=""
              color="#f9a8d4"
            />
          </View>

          {/* Weight Tracker */}
          <View style={styles.card}>
            <Text style={styles.chartLabel}>BODY WEIGHT</Text>
            <View style={styles.weightRow}>
              <View>
                <Text style={styles.weightCurrent}>
                  {latestWeight ? `${latestWeight} kg` : "— kg"}
                </Text>
                <Text style={styles.weightAvg}>7-day avg: {avgWeight} kg</Text>
              </View>
              <View style={styles.weightInputRow}>
                <TextInput
                  style={styles.weightInput}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="decimal-pad"
                  placeholder="kg"
                  placeholderTextColor="#444"
                />
                <TouchableOpacity
                  style={styles.weightButton}
                  onPress={handleSaveWeight}
                >
                  <Text style={styles.weightButtonText}>Log</Text>
                </TouchableOpacity>
              </View>
            </View>
            {weights.length > 0 && (
              <BarChart
                data={buildWeightData()}
                label=""
                color="#a78bfa"
                fixedMin={0}
                fixedMax={1}
              />
            )}
          </View>

          <View style={styles.card}>
            <BarChart
              data={buildChartData("sleep_hours")}
              label="Sleep (hours)"
              color="#6ee7b7"
            />
          </View>

          <View style={styles.card}>
            <BarChart
              data={buildChartData("mood")}
              label="Mood"
              color="#93c5fd"
            />
          </View>

          <View style={styles.card}>
            <BarChart
              data={buildChartData("energy")}
              label="Energy"
              color="#fcd34d"
            />
          </View>

          <View style={styles.card}>
            <BarChart
              data={buildSessionData()}
              label="Training Sessions"
              color="#f9a8d4"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {sessions.slice(0, 5).map((s, i) => (
              <View key={i} style={styles.sessionRow}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionType}>
                    {s.type === "Run" ? "🏃" : s.type === "Lift" ? "🏋️" : "📚"}
                    {"  "}
                    {s.type}
                  </Text>
                  <Text style={styles.sessionDate}>{s.date}</Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={styles.sessionDuration}>
                    {s.duration >= 60
                      ? `${Math.floor(s.duration / 60)}h ${s.duration % 60}m`
                      : `${s.duration}m`}
                  </Text>
                  <Text style={styles.sessionRpe}>RPE {s.rpe}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
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
  subtitle: { fontSize: 13, color: "#555", marginTop: 4, marginBottom: 24 },
  emptyState: { marginTop: 60, alignItems: "center", paddingHorizontal: 20 },
  emptyTitle: {
    fontSize: 18,
    color: "#444",
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#141414",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
  statUnit: { fontSize: 11, color: "#555" },
  statLabel: { fontSize: 10, color: "#555", marginTop: 4, textAlign: "center" },
  card: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  chartContainer: {},
  chartLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  barsRow: { flexDirection: "row", alignItems: "flex-end", height: 80 },
  barWrapper: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { borderRadius: 3 },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  barLabelText: { fontSize: 10, color: "#333" },
  weightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  weightCurrent: { fontSize: 28, fontWeight: "bold", color: "#a78bfa" },
  weightAvg: { fontSize: 12, color: "#555", marginTop: 2 },
  weightInputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  weightInput: {
    backgroundColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 16,
    width: 80,
    textAlign: "center",
  },
  weightButton: {
    backgroundColor: "#a78bfa",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  weightButtonText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  sectionTitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  sessionLeft: {},
  sessionType: { fontSize: 15, color: "#ffffff", fontWeight: "600" },
  sessionDate: { fontSize: 12, color: "#444", marginTop: 2 },
  sessionRight: { alignItems: "flex-end" },
  sessionDuration: { fontSize: 15, color: "#ffffff", fontWeight: "600" },
  sessionRpe: { fontSize: 12, color: "#444", marginTop: 2 },
});
