import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const LocationCard = ({ image, title, description, address, id }) => {
  const navigation = useNavigation();

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
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.address} numberOfLines={2}>
          {address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 180,
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
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
  },
});

export default LocationCard;
