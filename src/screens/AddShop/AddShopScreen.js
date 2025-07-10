import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../database/supabase";
import AuthGuard from "../../components/AuthGuard";

const AddShopScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    img_url: "",
    address: "", // Detailed street address
    building_no: "",
    neighborhood: "",
    district: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    category_id: null,
  });

  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchCategories();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(session?.user ?? null);
    } catch (error) {
      console.error("Error checking user:", error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id");

      if (error) {
        console.error("Error fetching categories:", error);
        Alert.alert("Error", "Failed to load categories");
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category_id: category.id });
    setShowCategories(false);
  };

  // Resim seçme fonksiyonu
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        console.log("Selected image:", selectedAsset.uri);
        setImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Form gönderme fonksiyonu
  const handleSubmit = async () => {
    // Combine address fields into a full address
    const fullAddress = `${formData.address} Sokak, No:${formData.building_no}, ${formData.neighborhood} Mahallesi, ${formData.district} İlçesi, ${formData.city}`;

    if (
      !image ||
      !formData.name ||
      !formData.address ||
      !formData.building_no ||
      !formData.neighborhood ||
      !formData.district ||
      !formData.city ||
      !formData.phone ||
      !formData.category_id
    ) {
      Alert.alert("Error", "Please fill all required fields and add an image");
      return;
    }

    setLoading(true);
    try {
      // 1. Kullanıcı kontrolü
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      // 2. Resim yükleme
      const fileExt = image.split(".").pop().toLowerCase();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Dosyayı base64 olarak oku
      const base64File = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Supabase'e yükle
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("shop-images")
        .upload(filePath, decode(base64File), {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 3. Public URL al
      const { data: urlData } = await supabase.storage
        .from("shop-images")
        .getPublicUrl(filePath);

      // 4. Shop verilerini kaydet
      const { error: insertError } = await supabase.from("shops").insert([
        {
          ...formData,
          address: fullAddress, // Use the combined address
          img_url: urlData.publicUrl,
          user_id: user.id,
        },
      ]);

      if (insertError) throw insertError;

      // Reset form data
      setFormData({
        name: "",
        img_url: "",
        address: "",
        building_no: "",
        neighborhood: "",
        district: "",
        city: "",
        phone: "",
        email: "",
        website: "",
        description: "",
        category_id: null,
      });
      setImage(null);
      setShowCategories(false);

      Alert.alert("Success", "Shop added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Base64'ü decode et
  const decode = (base64) => {
    const raw = atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }

    return array;
  };

  const validateForm = () => {
    if (!formData.name) return "Shop name is required";
    if (!formData.address) return "Address is required";
    if (!formData.phone) return "Phone number is required";
    if (!formData.category_id) return "Please select a category";
    if (!image) return "Please add a shop image";

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      return "Please enter a valid email address";
    }

    // Website validation
    if (formData.website && !/^https?:\/\//.test(formData.website)) {
      return "Website URL must start with http:// or https://";
    }

    return null;
  };

  if (!user) {
    return <AuthGuard />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Shop</Text>
      </View>

      <View style={styles.form}>
        <Pressable style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Shop Name"
            placeholderTextColor="#666"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </Pressable>

        {/* Görsel seçme ve önizleme */}
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="image-outline" size={40} color="#666" />
                <Text style={styles.placeholderText}>Add Shop Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Diğer form elemanları */}
        <View>
          <Pressable
            style={styles.categorySelector}
            onPress={() => setShowCategories(!showCategories)}
          >
            <Text
              style={[
                styles.categorySelectorText,
                !formData.category_id && { color: "#666" },
              ]}
            >
              {loadingCategories
                ? "Loading categories..."
                : categories.find((c) => c.id === formData.category_id)?.name ||
                  "Select Category"}
            </Text>
            <Ionicons
              name={showCategories ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </Pressable>

          {showCategories && (
            <View style={styles.categoriesList}>
              {loadingCategories ? (
                <ActivityIndicator
                  size="small"
                  color="#FF6B6B"
                  style={styles.loader}
                />
              ) : (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      formData.category_id === category.id &&
                        styles.selectedCategory,
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.category_id === category.id &&
                          styles.selectedCategoryText,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <Text style={styles.addressTitle}>Address Details</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter street"
            placeholderTextColor="#666"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter building number"
            placeholderTextColor="#666"
            value={formData.building_no}
            onChangeText={(text) =>
              setFormData({ ...formData, building_no: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Enter neighborhood"
            placeholderTextColor="#666"
            value={formData.neighborhood}
            onChangeText={(text) =>
              setFormData({ ...formData, neighborhood: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Enter district"
            placeholderTextColor="#666"
            value={formData.district}
            onChangeText={(text) =>
              setFormData({ ...formData, district: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Enter city"
            placeholderTextColor="#666"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor="#666"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Website"
          placeholderTextColor="#666"
          value={formData.website}
          onChangeText={(text) => setFormData({ ...formData, website: text })}
          keyboardType="url"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          placeholderTextColor="#666"
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Adding Shop..." : "Add Shop"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#111",
  },
  header: {
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#e0e0e0",
  },
  form: {
    padding: 20,
    paddingTop: 0,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    color: "#ffffff",
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: "#aaaaaa",
    marginBottom: 5,
    fontWeight: "500",
  },
  categorySelector: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 15,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  categorySelectorText: {
    color: "#fff",
    fontSize: 16,
  },
  categoriesList: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 5,
    zIndex: 1000,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryItem: {
    padding: 12,
    borderRadius: 6,
  },
  selectedCategory: {
    backgroundColor: "#FF6B6B",
  },
  categoryText: {
    color: "#fff",
    fontSize: 16,
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imagePickerButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,

    marginBottom: 15,
    overflow: "hidden",
    height: 150,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePickerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerText: {
    color: "#666",
    marginTop: 8,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#444",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePicker: {
    width: "100%",
    height: 150,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderText: {
    color: "#666",
    marginTop: 8,
    fontSize: 14,
  },
  addressSection: {
    marginBottom: 15,
    marginTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
});

export default AddShopScreen;
