import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Router from "./src/router";

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <StatusBar style="light" translucent={false} backgroundColor="#111" />
      <Router />
    </View>
  );
}
