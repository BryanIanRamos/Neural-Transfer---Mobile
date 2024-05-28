import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_KEY, API_URL } from "@env";

import { Picker } from "@react-native-picker/picker";

const Neural = ({ navigation }) => {
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedImageStyle, setSelectImageStyle] = useState(null);
  const [getResult, setGetResult] = useState(null);
  const [getStyleImage, setGetStyleImage] = useState(null);
  const [getPending, setGetPinding] = useState(false);
  const [styleTransferCompleted, setStyleTransferCompleted] = useState(false);
  const API = API_URL.toString();

  // console.log("API SERVER: ", API_KEY);
  // console.log("API_URL: ", API);

  const [selectImgSize, setSelectImgSize] = useState("128");
  const [selectSteps, setSelectSteps] = useState("50");

  console.log("selectImgSize:", selectImgSize);
  console.log("selectSteps:", selectSteps);

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
    `${API}/assets/?unstable_path=.%2Fstyles_img%2F2150159191.jpg&platform=android&hash=d6329fddc5f717f84eccb17428352992`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2F25739.jpg&platform=android&hash=fe611b5ace91bb276e3300f905b776aa`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2F2871.jpg&platform=android&hash=1e19ab63752ee6dd8db1795d12660e8e`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2F4922.jpg&platform=android&hash=e88e1b8f25e6354ba139683551b5a4f6`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2F562.jpg&platform=android&hash=a4fd5b096426167b6f3c33ab78013a5f`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2F57491.jpg&platform=android&hash=f9fdfe249218cc5265ccd4ddbbc39bce`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2Fbeautiful-cubism-graffiti.jpg&platform=android&hash=75e1d1f035fec1ca47be83bf86bbe65a`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2Fblue-paint-textured-background-aesthetic-diy-experimental-art.jpg&platform=android&hash=67307604b30002981dca5284a9bb1087`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2Fcolor_style.jpg&platform=android&hash=9088841c07de107ffe648e6f584d812a`,
    `${API}/assets/?unstable_path=.%2Fdancing.jpg&platform=android&hash=0a2df538901452d639170a2ed89815a4`,
    `${API}/assets/?unstable_path=.%2Fstyles_img%2Fpicasso.jpg&platform=android&hash=d1d60fc3f9d0b22d2d826c47934a37ea`,
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
    // console.log("Image URI:", uri);
    // console.log("Image Index:", index);
    setSelectImageStyle(uri);
    // Add your style picker logic here
  };

  const uploadImage = async (uri1, uri2) => {
    try {
      setStyleTransferCompleted(false);
      setGetPinding(true);

      console.log("Image Data:");
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
      formData.append("img_size", selectImgSize);
      formData.append("num_steps", selectSteps);

      console.log("FormData: ", formData);

      const response = await axios.post(
        `${API_KEY}/perform_style_transfer`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload response:", response.data);
      setStyleTransferCompleted(true);
      setGetPinding(false);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const resultPicker = async () => {
    try {
      const timestamp = Date.now(); // Unique timestamp
      const response = await axios.get(
        `${API_KEY}/get_image?timestamp=${timestamp}`
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
      <View style={{ marginVertical: 5 }}>
        <Button title="Back" onPress={() => navigation.navigate("Home")} />
      </View>

      <ScrollView>
        <View style={styles.rowContainer}>
          <View style={styles.container}>
            <TouchableOpacity onPress={contentImagePicker}>
              {selectedContent ? (
                <Image source={{ uri: selectedContent }} style={styles.image} />
              ) : (
                <View style={styles.imageBorder}>
                  <Text style={styles.blueText}>Add Content Image</Text>
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
                  <Text style={styles.blueText}>Add Style Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Selectable Styles*/}
        <View>
          <ScrollView horizontal>
            <View style={styles.subImageContainer}>
              {imageUrls.map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    sampleStylePicker(imageUrl, index),
                      console.log("Submitted Style Img URL: ", imageUrl.uri);
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

        {/* Value Picker  */}
        <View style={styles.pickerDisplay}>
          <View style={styles.pickerBorder}>
            <Picker
              selectedValue={selectImgSize}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) =>
                setSelectImgSize(itemValue)
              }
            >
              <Picker.Item label="128px" value="128" />
              <Picker.Item label="256px" value="256" />
              <Picker.Item label="512px" value="512" />
              <Picker.Item label="720px" value="720" />
            </Picker>
          </View>
          <View style={styles.pickerBorder}>
            <Picker
              selectedValue={selectSteps}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) =>
                setSelectSteps(itemValue)
              }
            >
              <Picker.Item label="50 times" value="50" />
              <Picker.Item label="100 times" value="100" />
              <Picker.Item label="150 times" value="150" />
              <Picker.Item label="200 times" value="200" />
              <Picker.Item label="250 times" value="250" />
              <Picker.Item label="300 times" value="300" />
              <Picker.Item label="350 times" value="350" />
              <Picker.Item label="400 times" value="400" />
              <Picker.Item label="450 times" value="450" />
              <Picker.Item label="500 times" value="500" />
              <Picker.Item label="550 times" value="550" />
              <Picker.Item label="600 times" value="600" />
              <Picker.Item label="650 times" value="650" />
              <Picker.Item label="700 times" value="700" />
              <Picker.Item label="750 times" value="750" />
              <Picker.Item label="800 times" value="800" />
              <Picker.Item label="850 times" value="850" />
              <Picker.Item label="900 times" value="900" />
              <Picker.Item label="950 times" value="950" />
              <Picker.Item label="1000 times" value="1000" />
            </Picker>
          </View>
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
          <TouchableOpacity
            onPress={() => navigation.navigate("Result")}
            style={[
              styles.button,
              styleTransferCompleted ? null : styles.disabledButton,
            ]}
            disabled={!styleTransferCompleted}
          >
            {styleTransferCompleted === null ? (
              <Text style={styles.buttonText}>Get Result Image</Text>
            ) : getPending === true ? (
              <Text style={styles.buttonText}>Processing...</Text>
            ) : (
              <Text style={styles.buttonText}>Get Result Image</Text>
            )}
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
    marginVertical: 20,
    width: 160,
    height: 160,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  styleImage: {
    width: 100,
    height: 100,
  },
  button: {
    backgroundColor: "#38CCDD",
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
  rowContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 1,
  },
  imageBorder: {
    marginVertical: 20,
    width: 160,
    height: 160,
    borderWidth: 2,
    borderColor: "blue",
    borderRadius: 5,
    borderStyle: "dotted",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBorder: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    overflow: "hidden",
    width: 150,
    height: 50,
  },
  picker: {
    width: "100%",
    height: "100%",
    fontSize: 1,
  },
  pickerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  blueText: {
    color: "blue",
  },
});

export default Neural;
