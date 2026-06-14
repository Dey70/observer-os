import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import { initDatabase } from "./src/database/database";
import DailyCheckin from "./src/screens/DailyCheckin";
import Dashboard from "./src/screens/Dashboard";
import SessionLogger from "./src/screens/SessionLogger";
import Chat from "./src/screens/Chat";

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0a0a0a",
            borderTopColor: "#1a1a1a",
            paddingBottom: 8,
            height: 60,
          },
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "#444444",
          tabBarLabelStyle: { fontSize: 11 },
        }}
      >
        <Tab.Screen
          name="Check-in"
          component={DailyCheckin}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 18 }}>☀️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Log"
          component={SessionLogger}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 18 }}>⚡</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 18 }}>📊</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Coach"
          component={Chat}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 18 }}>🤖</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
