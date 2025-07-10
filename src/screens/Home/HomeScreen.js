import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import TopSlider from "./components/TopSlider";
import SearchBar from "./components/SearchBar";
import CategoryGrid from "./components/CategoryGrid";
import PopularLocations from "./components/PopularLocations";
import RecentLocations from "./components/RecentLocations";
import { supabase } from "../../database/supabase";

const { width } = Dimensions.get("window");

const LocationCard = ({ location, style }) => {
  const navigation = useNavigation();
  const { id, image, title, description, address } = location;

  const handlePress = () => {
    navigation.navigate("ShopDetails", {
      shop: {
        id,
        name: title,
        img_url: image,
        description,
        address,
      },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.locationCard, style]}
      onPress={handlePress}
    >
      <Image
        source={{ uri: image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.cardAddress} numberOfLines={2}>
          {address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShops, setFilteredShops] = useState([]);
  const [allShops, setAllShops] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredShops([]);
      return;
    }

    const filtered = allShops.filter((shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredShops(filtered);
  }, [searchQuery, allShops]);

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllShops(data || []);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  const renderSearchResults = () => {
    if (searchQuery.trim() === "") return null;

    return (
      <View style={styles.searchResultsContainer}>
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsTitle}>
            Search Results ({filteredShops.length})
          </Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={true}
          style={styles.searchResultsScroll}
          contentContainerStyle={styles.searchResultsContent}
        >
          {filteredShops.map((shop) => (
            <LocationCard
              key={shop.id}
              location={{
                id: shop.id,
                title: shop.name,
                image: shop.img_url,
                description: shop.description,
                address: shop.address,
              }}
              style={styles.searchResultCard}
            />
          ))}
          {filteredShops.length === 0 && (
            <Text style={styles.noResultsText}>No shops found</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
        <TopSlider />
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search shops by name..."
          />
        </View>
        {renderSearchResults()}
        <CategoryGrid />
        <PopularLocations />
        <RecentLocations />
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
  searchContainer: {
    backgroundColor: "#111",
    zIndex: 1,
  },
  searchResultsContainer: {
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    overflow: "hidden",
    maxHeight: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultsHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  searchResultsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  searchResultsScroll: {
    maxHeight: 350,
  },
  searchResultsContent: {
    padding: 8,
  },
  searchResultCard: {
    width: width - 70,
    marginBottom: 15,
  },
  noResultsText: {
    color: "#666",
    textAlign: "center",
    padding: 20,
    fontSize: 16,
  },
  locationCard: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#222",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  cardAddress: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
  },
});

export default HomeScreen;
