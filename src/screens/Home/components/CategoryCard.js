import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CategoryCard = ({ category }) => {
  const navigation = useNavigation();

  // Kategori ikonlarını ve renklerini belirle
  const getCategoryConfig = (categoryName) => {
    const configs = {
      restaurants: {
        icon: "restaurant-outline",
        color: "#FF6B6B",
      },
      cafes: {
        icon: "cafe-outline",
        color: "#4ECDC4",
      },
      shopping: {
        icon: "cart-outline",
        color: "#45B7D1",
      },
      entertainment: {
        icon: "film-outline",
        color: "#96CEB4",
      },
      sports: {
        icon: "basketball-outline",
        color: "#D4A373",
      },
      accommodation: {
        icon: "bed-outline",
        color: "#8E44AD", // Mor tonu, konaklama için şık bir renk
      },
    };

    return (
      configs[categoryName.toLowerCase()] || {
        icon: "storefront-outline",
        color: "#FF6B6B",
      }
    );
  };

  const config = getCategoryConfig(category.name);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("Category", {
          categoryId: category.id,
          categoryName: category.name,
        })
      }
    >
      <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={28} color="#FFF" />
      </View>
      <Text style={styles.text}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default CategoryCard;
