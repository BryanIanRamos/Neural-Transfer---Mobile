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
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import axios from "axios";
import { API_URL, API_KEY } from "@env";

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
      <Text>Generate Your Own Art</Text>
      <Button
        title="Go to Neural Screen"
        onPress={() => navigation.navigate("Generate")}
      />
      <Text>Recent Images</Text>

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
    borderColor: "#000", // Set the border color
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
});
