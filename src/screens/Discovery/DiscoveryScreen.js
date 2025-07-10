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
import { supabase } from "../../database/supabase";

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
      color: "#8E44AD",
    },
  };

  return (
    configs[categoryName.toLowerCase()] || {
      icon: "storefront-outline",
      color: "#FF6B6B",
    }
  );
};

const DiscoveryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [shopsByCategory, setShopsByCategory] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [allShops, setAllShops] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      // Restore original grouping when search is cleared
      groupShopsByCategory(allShops);
      return;
    }

    // Filter shops based on search query
    const filteredShops = allShops.filter((shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered shops by category
    groupShopsByCategory(filteredShops);
  }, [searchQuery]);

  const groupShopsByCategory = (shops) => {
    const grouped = shops.reduce((acc, shop) => {
      if (!acc[shop.category_id]) {
        acc[shop.category_id] = [];
      }
      acc[shop.category_id].push({
        id: shop.id,
        title: shop.name,
        image: shop.img_url,
        description: shop.description,
        address: shop.address,
      });
      return acc;
    }, {});

    setShopsByCategory(grouped);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("id");

      if (categoriesError) throw categoriesError;

      // Map categories with their icons
      const mappedCategories = categoriesData.map((category) => {
        const config = getCategoryConfig(category.name);
        return {
          ...category,
          icon: config.icon,
          color: config.color,
        };
      });

      setCategories(mappedCategories);

      // Fetch all shops
      const { data: shopsData, error: shopsError } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });

      if (shopsError) throw shopsError;

      setAllShops(shopsData);
      groupShopsByCategory(shopsData);
    } catch (error) {
      console.error("Error loading data:", error.message);
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
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search shops by name..."
        />
        {categories.map((category) => {
          const categoryShops = shopsByCategory[category.id] || [];
          if (searchQuery.trim() !== "" && categoryShops.length === 0) {
            return null;
          }
          return (
            <CategorySection
              key={category.id}
              category={{
                id: category.id,
                label: category.name,
                icon: category.icon,
                color: category.color,
              }}
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
