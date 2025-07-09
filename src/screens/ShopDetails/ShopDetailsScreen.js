import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../database/supabase";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const ShopDetailsScreen = ({ route, navigation }) => {
  const { shop } = route.params;
  const insets = useSafeAreaInsets();
  const [isOpenTimeExpanded, setIsOpenTimeExpanded] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState(null);

  useEffect(() => {
    if (shop.user_id) {
      fetchOwnerProfile();
    }
  }, [shop.user_id]);

  const fetchOwnerProfile = async () => {
    try {
      // Just try to get the profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, email, avatar_url")
        .eq("id", shop.user_id)
        .maybeSingle();

      // If we have profile data, use it
      if (profileData) {
        setOwnerProfile({
          ...profileData,
          id: shop.user_id,
        });
      } else {
        // If no profile data, just show "Shop Owner"
        setOwnerProfile({
          id: shop.user_id,
          username: "Shop Owner",
          avatar_url: null,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // On error, show default profile
      setOwnerProfile({
        id: shop.user_id,
        username: "Shop Owner",
        avatar_url: null,
      });
    }
  };

  const handleCall = () => {
    if (shop.phone) {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };

  const handleEmail = () => {
    if (shop.email) {
      Linking.openURL(`mailto:${shop.email}`);
    }
  };

  const handleWebsite = () => {
    if (shop.website) {
      Linking.openURL(shop.website);
    }
  };

  const handleAddress = () => {
    if (shop.address) {
      const encodedAddress = encodeURIComponent(shop.address);
      Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
    }
  };

  const renderOpeningHours = () => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days.map((day) => (
      <View key={day} style={styles.timeRow}>
        <Text style={styles.dayText}>{day}</Text>
        <Text style={styles.timeText}>09:00 - 18:00</Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{ uri: shop.img_url }}
          placeholder={blurhash}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <View style={styles.overlay} />

        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Owner Profile Section */}
        <View style={styles.ownerSection}>
          <View style={styles.ownerInfo}>
            <Image
              style={styles.ownerAvatar}
              source={{
                uri:
                  ownerProfile?.avatar_url || "https://via.placeholder.com/100",
              }}
              placeholder={blurhash}
              contentFit="cover"
            />
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName}>
                {ownerProfile?.username || "Shop Owner"}
              </Text>
              {ownerProfile?.email ? (
                <Text style={styles.ownerEmail}>{ownerProfile.email}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Shop Name and Rating */}
        <View style={styles.headerSection}>
          <Text style={styles.name}>{shop.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.categoryTag}>Accommodation</Text>
            <View style={styles.ratingWrapper}>
              <Text style={styles.ratingNumber}>1</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <Ionicons
                    key={index}
                    name="star"
                    size={16}
                    color={index < (shop.rating || 1) ? "#FFD700" : "#666"}
                  />
                ))}
                <Text style={styles.reviewCount}>(1)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
            <View style={styles.iconContainer}>
              <Ionicons name="call-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.infoText}>{shop.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoRow} onPress={handleAddress}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.infoText}>{shop.address}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.infoText}>{shop.email}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoRow} onPress={handleWebsite}>
            <View style={styles.iconContainer}>
              <Ionicons name="globe-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.infoText}>{shop.website}</Text>
          </TouchableOpacity>
        </View>

        {/* Opening Hours */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setIsOpenTimeExpanded(!isOpenTimeExpanded)}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Open Time</Text>
            </View>
            <Ionicons
              name={isOpenTimeExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#666"
            />
          </View>
          {isOpenTimeExpanded && (
            <View style={styles.timeTable}>{renderOpeningHours()}</View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  imageContainer: {
    height: width * 0.7,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  content: {
    flex: 1,
    backgroundColor: "#000",
    marginTop: -10,
  },
  ownerSection: {
    padding: 16,
    backgroundColor: "#111",
    marginBottom: 16,
    borderRadius: 12,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  ownerEmail: {
    color: "#888",
    fontSize: 14,
  },
  headerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  categoryTag: {
    color: "#999",
    fontSize: 14,
    marginBottom: 4,
  },
  ratingWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  reviewCount: {
    color: "#999",
    fontSize: 14,
    marginLeft: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  timeTable: {
    marginTop: 16,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  dayText: {
    color: "#999",
    fontSize: 14,
  },
  timeText: {
    color: "#4CAF50",
    fontSize: 14,
  },
  priceSection: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 4,
  },
  priceAmount: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  bookButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ShopDetailsScreen;
