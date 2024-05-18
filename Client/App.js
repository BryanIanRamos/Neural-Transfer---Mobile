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
  const [getStyleImage, setGetStyleImage] = useState(null);
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

  // Sample image URLs
  const imageUrls = [
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2F2150159191.jpg&platform=android&hash=d6329fddc5f717f84eccb17428352992",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2F25739.jpg&platform=android&hash=fe611b5ace91bb276e3300f905b776aa",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2F2871.jpg&platform=android&hash=1e19ab63752ee6dd8db1795d12660e8e",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2F4922.jpg&platform=android&hash=e88e1b8f25e6354ba139683551b5a4f6",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2F562.jpg&platform=android&hash=a4fd5b096426167b6f3c33ab78013a5f",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2F57491.jpg&platform=android&hash=f9fdfe249218cc5265ccd4ddbbc39bce",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2Fbeautiful-cubism-graffiti.jpg&platform=android&hash=75e1d1f035fec1ca47be83bf86bbe65a",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2Fblue-paint-textured-background-aesthetic-diy-experimental-art.jpg&platform=android&hash=67307604b30002981dca5284a9bb1087",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2Fcolor_style.jpg&platform=android&hash=9088841c07de107ffe648e6f584d812a",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2Fdancing.jpg&platform=android&hash=0a2df538901452d639170a2ed89815a4",
    "http://192.168.1.11:8081/assets/?unstable_path=.%2Fstyles_img%2Fpicasso.jpg&platform=android&hash=d1d60fc3f9d0b22d2d826c47934a37ea",
  ];

  // const resolvedImageUrls = imageUrls.map(
  //   (image) => Image.resolveAssetSource(image).uri
  // );

  // console.log(resolvedImageUrls);

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

  const sampleStylePicker = (uri, index) => {
    console.log("Image URI:", uri);
    console.log("Image Index:", index);
    setSelectImageStyle(uri);
    // Add your style picker logic here
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
        <View style={styles.rowContainer}>
          <View style={styles.container}>
            <TouchableOpacity onPress={contentImagePicker}>
              {selectedContent ? (
                <Image source={{ uri: selectedContent }} style={styles.image} />
              ) : (
                <View style={styles.imageBorder}>
                  <Text>No result image yet</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.container}>
            <TouchableOpacity onPress={styleImagePicker}>
              {selectedImageStyle ? (
                <Image
                  source={{ uri: selectedImageStyle }}
                  // source={imageUrl.uri ? imageUrl : { uri: imageUrl }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.imageBorder}>
                  <Text>Add Style Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Test  */}
        <View>
          <ScrollView horizontal>
            <View style={styles.subImageContainer}>
              {imageUrls.map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    sampleStylePicker(imageUrl, index),
                      console.log(imageUrl.uri);
                  }}
                >
                  <Image
                    key={index}
                    // source={imageUrl}
                    source={{ uri: imageUrl }}
                    style={styles.styleImage}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View>
          <TouchableOpacity
            onPress={() => uploadImage(selectedContent, selectedImageStyle)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Upload Images</Text>
          </TouchableOpacity>
        </View>
        <View>
          {getResult ? (
            <Image source={{ uri: getResult }} style={styles.image} />
          ) : (
            <View>
              <Text>No result image yet</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={resultPicker}
            style={[
              styles.button,
              styleTransferCompleted ? null : styles.disabledButton,
            ]}
            disabled={!styleTransferCompleted}
          >
            <Text style={styles.buttonText}>Get Result Image</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    margin: 20,
  },
  container: {
    alignItems: "center",
    marginBottom: 5,
  },
  subImageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 160,
    height: 160,
  },
  styleImage: {
    width: 100,
    height: 100,
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
  rowContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  imageBorder: {
    width: 160,
    height: 160,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
