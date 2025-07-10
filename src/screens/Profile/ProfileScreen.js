import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../database/supabase";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthGuard from "../../components/AuthGuard";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [user, setUser] = useState(null);
  const [userShops, setUserShops] = useState([]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserShops();
    }
  }, [user]);

  const fetchUserShops = async () => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserShops(data || []);
    } catch (error) {
      console.error("Error fetching user shops:", error);
    }
  };

  const checkUser = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(session?.user ?? null);
      if (session?.user) {
        await getProfile();
      }
    } catch (error) {
      console.error("Error checking user:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        console.log("Selected image:", selectedAsset.uri);
        setSelectedImage(selectedAsset.uri);
        await uploadAvatar(selectedAsset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      setUploading(true);

      const fileExt = uri.split(".").pop().toLowerCase();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      // base64 olarak oku
      const base64File = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // base64'i Uint8Array'e çevir (decode fonksiyonu)
      const decode = (base64) => {
        const binaryString = global.atob ? atob(base64) : base64Decode(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      };

      // Eğer atob desteklenmiyorsa (expo'da genelde yoktur), kendin tanımla
      const base64Decode = (input) => {
        const chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let str = input.replace(/=+$/, "");
        let output = "";

        for (
          let bc = 0, bs, buffer, idx = 0;
          (buffer = str.charAt(idx++));
          ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
            ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
            : 0
        ) {
          buffer = chars.indexOf(buffer);
        }

        return output;
      };

      const fileBytes = decode(base64File);

      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(filePath, fileBytes, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from("user-images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: urlData.publicUrl,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      await getProfile();
      Alert.alert("Success", "Profile photo updated!");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    try {
      setUploading(true); // Reusing the loading state

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: newUsername.trim(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      await getProfile();
      setIsEditingUsername(false);
      Alert.alert("Success", "Username updated successfully!");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      navigation.reset({
        index: 0,
        routes: [{ name: "Auth", params: { screen: "Auth" } }],
      });
    } catch (error) {
      console.error("Error signing out:", error.message);
      Alert.alert("Error", "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const renderShopCard = (shop) => (
    <TouchableOpacity
      key={shop.id}
      style={styles.shopCard}
      onPress={() => navigation.navigate("ShopDetails", { shop })}
    >
      <Image source={{ uri: shop.img_url }} style={styles.shopImage} />
      <View style={styles.shopInfo}>
        <Text style={styles.shopName} numberOfLines={1}>
          {shop.name}
        </Text>
        <Text style={styles.shopAddress} numberOfLines={2}>
          {shop.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  if (!user) {
    return <AuthGuard />;
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loading}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Photo Section */}
          <View style={styles.photoContainer}>
            <TouchableOpacity onPress={pickImage} disabled={uploading}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                  resizeMode="cover"
                  onError={(e) =>
                    console.log("Image loading error:", e.nativeEvent.error)
                  }
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#666" />
                </View>
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* User Info Section */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Username</Text>
              {isEditingUsername ? (
                <View style={styles.editUsernameContainer}>
                  <TextInput
                    style={styles.usernameInput}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder={profile?.username || "Enter username"}
                    placeholderTextColor="#666"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={updateUsername}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditingUsername(false);
                      setNewUsername("");
                    }}
                  >
                    <Ionicons name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.usernameContainer}>
                  <Text style={styles.value}>
                    {profile?.username || "Not set"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setNewUsername(profile?.username || "");
                      setIsEditingUsername(true);
                    }}
                    style={styles.editButton}
                  >
                    <Ionicons name="pencil" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile?.email}</Text>
            </View>
          </View>

          {/* Saved Shops Section Placeholder */}
          <View style={styles.savedShopsContainer}>
            <Text style={styles.sectionTitle}>Saved Shops</Text>
            <Text style={styles.comingSoon}>Coming soon...</Text>
          </View>

          {/* User's Shops Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Shops</Text>
            <View style={styles.shopsContainer}>
              {userShops.length > 0 ? (
                userShops.map(renderShopCard)
              ) : (
                <Text style={styles.noShopsText}>
                  You haven't added any shops yet
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthGuard>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#ff6b6b",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    color: "#fff",
  },
  savedShopsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  comingSoon: {
    color: "#666",
    fontStyle: "italic",
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  editUsernameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "70%",
  },
  usernameInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#666",
    paddingVertical: 4,
  },
  saveButton: {
    backgroundColor: "#ff6b6b",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#333",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  shopsContainer: {
    gap: 12,
  },
  shopCard: {
    flexDirection: "row",
    backgroundColor: "#222",
    borderRadius: 12,
    overflow: "hidden",
    height: 100,
  },
  shopImage: {
    width: 100,
    height: "100%",
  },
  shopInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 14,
    color: "#999",
    lineHeight: 18,
  },
  noShopsText: {
    color: "#666",
    textAlign: "center",
    padding: 20,
    fontSize: 16,
  },
});

export default ProfileScreen;
