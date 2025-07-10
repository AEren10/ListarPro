import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import CategoryHeader from "./CategoryHeader";
import LocationCard from "./LocationCard";

const CategorySection = ({ category, locations }) => {
  return (
    <View style={styles.container}>
      <CategoryHeader
        icon={category.icon}
        title={category.label}
        count={locations.length}
        color={category.color}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            id={location.id}
            image={location.image}
            title={location.title}
            description={location.description}
            address={location.address}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});

export default CategorySection;
