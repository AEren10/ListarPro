import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  View,
} from "react-native";
import SearchBar from "../Home/components/SearchBar";
import CategorySection from "./components/CategorySection";
import { categories } from "../../constants/icons";
import { shopsService } from "../../database/shops";

const DiscoveryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [shopsByCategory, setShopsByCategory] = useState({});

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      console.log("Fetching shops...");
      const allShops = await shopsService.getAllShops();
      console.log("Fetched shops:", allShops);

      // Group shops by category
      const grouped = allShops.reduce((acc, shop) => {
        if (!acc[shop.category_id]) {
          acc[shop.category_id] = [];
        }
        acc[shop.category_id].push({
          id: shop.id,
          title: shop.name,
          image: shop.image_url,
          description: shop.description,
        });
        return acc;
      }, {});

      console.log("Grouped shops by category:", grouped);
      setShopsByCategory(grouped);
    } catch (error) {
      console.error("Error loading shops:", error.message);
      console.error("Full error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <SearchBar />
        {categories.map((category) => {
          const categoryShops = shopsByCategory[category.id] || [];
          console.log(`Shops for category ${category.id}:`, categoryShops);
          return (
            <CategorySection
              key={category.id}
              category={category}
              locations={categoryShops}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DiscoveryScreen;
