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
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedImageStyle, setSelectImageStyle] = useState(null);
  const API = "http://192.168.1.11:5000";

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

  const contentImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const contentResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1], // Set aspect ratio to 1:1 for square crop
      quality: 1,
    });
    if (contentResult.cancelled === true) {
      return;
    }

    const selectedUri = contentResult.assets[0]?.uri;
    setSelectedContent(selectedUri);
    console.log("Selected Content image URI:", selectedUri);

    // Upload the image to the server
    // uploadImage(selectedUri);
  };

  const styleImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const styleResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1], // Set aspect ratio to 1:1 for square crop
      quality: 1,
    });
    if (styleResult.cancelled === true) {
      return;
    }

    const selectedUri = styleResult.assets[0]?.uri;
    setSelectImageStyle(selectedUri);
    console.log("Selected Style image URI:", selectedUri);
  };

  const uploadImage = async (uri1, uri2) => {
    try {
      console.log("URI 1: ", uri1);
      console.log("URI 2: ", uri2);

      const formData = new FormData();
      formData.append("content_img", {
        uri: uri1,
        name: "content.jpg",
        type: "image/jpg",
      });
      formData.append("style_img", {
        uri: uri2,
        name: "style.jpg",
        type: "image/jpg",
      });

      console.log("FormData: ", formData);

      const response = await axios.post(
        `${API}/perform_style_transfer`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload response:", response.data);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {selectedContent ? (
          <Image source={{ uri: selectedContent }} style={styles.image} />
        ) : (
          <Text>No image selected</Text>
        )}
        <TouchableOpacity onPress={contentImagePicker} style={styles.button}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {selectedImageStyle ? (
          <Image source={{ uri: selectedImageStyle }} style={styles.image} />
        ) : (
          <Text>No image selected</Text>
        )}
        <TouchableOpacity onPress={styleImagePicker} style={styles.button}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          onPress={() => uploadImage(selectedContent, selectedImageStyle)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Upload Image</Text>
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
