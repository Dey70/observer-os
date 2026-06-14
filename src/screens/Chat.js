import { View, Text, StyleSheet } from "react-native";

export default function Chat() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI Coach coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#444", fontSize: 16 },
});
