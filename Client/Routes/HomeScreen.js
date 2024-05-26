import React, { useEffect, useState } from "react";
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
import * as MediaLibrary from "expo-media-library"; // Import MediaLibrary for saving images
import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook
import axios from "axios";
import { API_URL, API_KEY } from "@env"; // Ensure these are correctly set in your .env file

export default function HomeScreen() {
  const navigation = useNavigation(); // Initialize navigation hook

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // Track selected image
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_KEY}/recent_images`);
      setImages(response.data.images);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <Text>Generate Your Own Art</Text>
      <Button
        title="Go to Neural Screen"
        onPress={() => navigation.navigate("Neural")}
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
    borderWidth: 5,
    borderColor: "#000", // Set the border color
    borderRadius: 10, // Optional, for rounded corners
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
