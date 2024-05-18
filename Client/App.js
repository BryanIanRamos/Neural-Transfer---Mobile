import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const App = () => {
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedImageStyle, setSelectImageStyle] = useState(null);
  const [getResult, setGetResult] = useState(null);
  const [styleTransferCompleted, setStyleTransferCompleted] = useState(false);
  const API = "http://192.168.1.11:5000";

  // useEffect(() => {
  //   (async () => {
  //     if (Platform.OS !== "web") {
  //       const { status } =
  //         await ImagePicker.requestMediaLibraryPermissionsAsync();
  //       if (status !== "granted") {
  //         alert("Permission to access camera roll is required!");
  //       }
  //     }
  //   })();
  // }, []);

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
      setStyleTransferCompleted(false);

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
      setStyleTransferCompleted(true);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const resultPicker = async () => {
    try {
      const timestamp = Date.now(); // Unique timestamp
      const response = await axios.get(
        `${API}/get_image?timestamp=${timestamp}`
      );
      const resultUri = response.config.url; // Adjust this based on your backend response

      setGetResult(resultUri);
      console.log("Result image URI:", resultUri);
    } catch (error) {
      console.error("Error fetching result image:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView>
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
        <View>
          {getResult ? (
            <Image source={{ uri: getResult }} style={styles.image} />
          ) : (
            <Text>No image selected</Text>
          )}
          <TouchableOpacity
            onPress={resultPicker}
            style={[
              styles.button,
              styleTransferCompleted ? null : styles.disabledButton,
            ]}
            disabled={!styleTransferCompleted}
          >
            <Text>Get Image</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
});

export default App;
