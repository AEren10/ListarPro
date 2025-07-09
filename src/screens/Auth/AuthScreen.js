import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const AuthScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Image */}
      <Image
        style={styles.backgroundImage}
        //source={require("../../assets/auth-bg.jpg")}
        contentFit="cover"
      />
      <View style={styles.overlay} />

      {/* Logo Section */}
      <View style={[styles.logoContainer, { marginTop: insets.top + 60 }]}>
        <Image
          style={styles.logo}
          //source={require("../../assets/icon.png")}
          contentFit="contain"
        />
        <Text style={styles.appName}>ListarPro</Text>
        <Text style={styles.tagline}>Discover Amazing Places</Text>
      </View>

      {/* Buttons Container */}
      <View
        style={[styles.buttonsContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate("Login")}
        >
          <Ionicons
            name="log-in-outline"
            size={24}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate("Register")}
        >
          <Ionicons
            name="person-add-outline"
            size={24}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Guest Mode Button */}
        <TouchableOpacity
          style={[styles.button, styles.guestButton]}
          onPress={() => navigation.navigate("MainApp")}
        >
          <Ionicons
            name="arrow-forward-outline"
            size={24}
            color="#666"
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, styles.guestButtonText]}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 20,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  loginButton: {
    backgroundColor: "#ff6b6b",
  },
  registerButton: {
    backgroundColor: "#4CAF50",
  },
  guestButton: {
    backgroundColor: "#fff",
    marginTop: 8,
  },
  guestButtonText: {
    color: "#666",
  },
});

export default AuthScreen;
