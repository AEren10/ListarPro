import React from "react";
import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import TopSlider from "./components/TopSlider";
import SearchBar from "./components/SearchBar";
import CategoryGrid from "./components/CategoryGrid";
import PopularLocations from "./components/PopularLocations";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TopSlider />
        <SearchBar />
        <CategoryGrid />
        <PopularLocations />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  content: {
    flex: 1,
    backgroundColor: "#111",
  },
  scrollView: {
    flex: 1,
  },
});

export default HomeScreen;
