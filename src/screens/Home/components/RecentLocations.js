import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { supabase } from "../../../database/supabase";
import { useNavigation } from "@react-navigation/native";

const RecentLocations = () => {
  const [recentShops, setRecentShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchRecentShops();
  }, []);

  const fetchRecentShops = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentShops(data || []);
    } catch (error) {
      console.error("Error fetching recent shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopPress = (shop) => {
    navigation.navigate("ShopDetails", { shop });
  };

  if (recentShops.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Locations</Text>
        <Text style={styles.subtitle}>Latest additions to explore</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentShops.map((shop) => (
          <TouchableOpacity
            key={shop.id}
            style={styles.card}
            onPress={() => handleShopPress(shop)}
          >
            <Image
              source={{ uri: shop.img_url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.address} numberOfLines={1}>
                {shop.address}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 250,
    height: 200,
    marginRight: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
});

export default RecentLocations;
