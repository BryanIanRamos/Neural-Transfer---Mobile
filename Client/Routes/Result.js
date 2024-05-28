import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { API_KEY, API_URL } from "@env";

export default function Result({ navigation }) {
  const [getResult, setGetResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const API = API_KEY;

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

  useEffect(() => {
    resultPicker();
  }, []);

  const handleDownload = async () => {
    if (!getResult) {
      Alert.alert("No image to download");
      return;
    }

    const uri = getResult;
    const fileUri = FileSystem.documentDirectory + "downloaded_image.jpg";
    try {
      const { uri: downloadedUri } = await FileSystem.downloadAsync(
        uri,
        fileUri
      );
      Alert.alert("Download Success", `Image downloaded to: ${downloadedUri}`);
    } catch (error) {
      Alert.alert("Download Error", "Failed to download image");
      console.error("Error downloading image:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <Image source={{ uri: getResult }} style={styles.modalImage} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      <View>
        {getResult ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={{ uri: getResult }} style={styles.image} />
          </TouchableOpacity>
        ) : (
          <View style={styles.imageEmpty}>
            <Text style={{ fontSize: 20, color: "gray" }}>
              Loading Image...
            </Text>
          </View>
        )}
        <TouchableOpacity onPress={handleDownload} style={styles.button}>
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    marginVertical: 10,
    // borderWidth: 1,
    width: 300,
    height: 300,
    borderRadius: 5,
    // borderColor: "#5A5DFA",
    borderStyle: "dotted",
  },
  imageEmpty: {
    marginVertical: 10,
    borderWidth: 2,
    width: 300,
    height: 300,
    borderRadius: 5,
    borderColor: "gray",
    borderStyle: "dotted",
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
