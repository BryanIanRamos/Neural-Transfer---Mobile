import React, { useEffect, useState, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import axios from "axios";
import { API_URL, API_KEY } from "@env";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const navigation = useNavigation();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_KEY}/recent_images`); // corrected API_URL usage
      setImages(response.data.images);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const downloadImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status === "granted") {
        const asset = await MediaLibrary.createAssetAsync(selectedImage);
        await MediaLibrary.saveToLibraryAsync(asset);
        Alert.alert("Success", "Image downloaded successfully!");
      } else {
        Alert.alert(
          "Permission Denied",
          "Please grant permission to download images."
        );
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      Alert.alert("Error", "Failed to download image. Please try again later.");
    }
  };

  // Fetch images on initial load and when screen gains focus
  useEffect(() => {
    fetchImages();
  }, []);

  // Use useFocusEffect to refresh images when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchImages();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>✨Generate Your Own Art ✨</Text>
      <TouchableOpacity
        // title="Go to Neural Screen"
        style={{
          paddingVertical: 30,
          backgroundColor: "#5A5DFA",
          paddingHorizontal: 53,
          flexDirection: "row",
          gap: 9,
          alignItems: "center",
          borderRadius: 7,
        }}
        onPress={() => navigation.navigate("Generate")}
      >
        <Ionicons name="add-circle" size={50} color="white" />
        <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
          Generate Art
        </Text>
      </TouchableOpacity>

      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          // paddingHorizontal: 20,
          // borderWidth: 3,
          width: "86%",
          marginTop: 30,
        }}
      >
        <Text style={{ fontSize: 18, color: "gray", fontWeight: 500 }}>
          Recent Images
        </Text>
      </View>

      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "black",
          width: "86%",
          marginTop: 10,
          marginBottom: 20,
          borderColor: "gray",
        }}
      />

      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openImageModal(item)}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item }} style={styles.image} />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal to display fullscreen image */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={downloadImage}
          >
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: "gray", // Set the border color
    borderRadius: 3, // Optional, for rounded corners
    margin: 5,
  },
  image: {
    width: 300,
    height: 180,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  fullScreenImage: {
    width: "90%",
    height: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  downloadButton: {
    position: "absolute",
    bottom: 110,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  header: {
    fontWeight: "bold",
    fontSize: 23,
    paddingTop: 18,
    paddingBottom: 25,
    color: "#5A5DFA",
  },
});
