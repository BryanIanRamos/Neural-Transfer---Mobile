import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

const API_BASE_URL = "http://192.168.1.59:5000"; // Replace with your server's IP address and port

export default function App() {
  const [image, setImage] = useState(null);
  const [uploadResponse, setUploadResponse] = useState("");
  const [data, setData] = useState(null);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("ImagePicker result:", result);

      if (!result.cancelled) {
        if (result.uri) {
          setImage(result.uri);
          uploadImage(result.uri);
        } else {
          console.error("Error uploading image: URI is undefined");
        }
      } else {
        console.log("Image selection cancelled");
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) {
      console.error("Error uploading image: URI is undefined");
      return;
    }

    let formData = new FormData();
    let uriParts = uri.split(".");
    let fileType = uriParts[uriParts.length - 1];

    formData.append("image", {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    try {
      let response = await fetch(`${API_BASE_URL}/upload_image`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      let json = await response.json();
      setUploadResponse(json.message);
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };

  const getImage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_image`);
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result;
        setImage(base64data); // Use setImage instead of setImageData
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const getData = async () => {
    try {
      let response = await fetch(`${API_BASE_URL}/get_data`);
      let json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error getting data: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}
      <Text>{uploadResponse}</Text>
      <Button title="Get Image" onPress={getImage} />
      <Button title="Get Data" onPress={getData} />

      {data && (
        <View>
          <Text>Name: {data.name}</Text>
          <Text>Age: {data.age}</Text>
          <Text>City: {data.city}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
