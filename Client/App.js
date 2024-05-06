import React, { useState } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.59:5000"; // Change this to your server's IP address and port

const App = () => {
  const [imageURI, setImageURI] = useState(null);
  const [data, setData] = useState(null);

  const handleUploadImage = async () => {
    try {
      const uri = "image.png"; // Update with actual image URI
      const type = uri.endsWith(".png") ? "image/png" : "image/jpeg"; // Determine image type dynamically
      const name = "image." + (type === "image/png" ? "png" : "jpeg"); // Set image name dynamically
      
      const data = new FormData();
      data.append('file', {
        uri,
        type,
        name,
      });

      const response = await axios.post(`${API_BASE_URL}/upload_image`, data);
      console.log(response.data);
      // Fetch image after upload
      fetchImage();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchImage = async () => {
    try {
      const response = await fetch(API_BASE_URL + "/get_image");
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result;
        setImageURI(base64data);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchData = async () => {
    try {
      const dataResponse = await axios.get(`${API_BASE_URL}/get_data`);
      setData(dataResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Upload Image" onPress={handleUploadImage} />
      <Button title="Fetch Image" onPress={fetchImage} />
      <Button title="Fetch Data" onPress={fetchData} />
      {imageURI && <Image source={{ uri: imageURI }} style={styles.image} />}
      {data && (
        <View style={styles.dataContainer}>
          <Text>Name: {data.name}</Text>
          <Text>Age: {data.age}</Text>
          <Text>City: {data.city}</Text>
        </View>
      )}
    </View>
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
    marginVertical: 20,
  },
  dataContainer: {
    marginTop: 20,
  },
});

export default App;
