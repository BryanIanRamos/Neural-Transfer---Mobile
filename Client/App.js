import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const API = "http://192.168.1.55:5000";

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access camera roll is required!");
        }
      }
    })();
  }, []);

  const openImagePickerAsync = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.cancelled === true) {
      return;
    }

    // Accessing the URI from the assets array
    const selectedUri = pickerResult.assets[0]?.uri;
    setSelectedImage(selectedUri);
    console.log("Selected image URI:", selectedUri);

    // Upload the image to the server
    uploadImage(selectedUri);
  };

  const uploadImage = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "image.jpg",
        type: "image/jpg",
      });

      const response = await axios.post(`${API}/upload_image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Text>No image selected</Text>
        )}
        <TouchableOpacity onPress={openImagePickerAsync} style={styles.button}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "skyblue",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
});

export default App;
