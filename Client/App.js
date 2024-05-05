import React, { useState } from 'react';
import { View, Text, Button, Image } from 'react-native';

const App = () => {
  const [imageData, setImageData] = useState(null);
  const [data, setData] = useState(null);

  const fetchImage = async () => {
    try {
      const response = await fetch('http://192.168.1.4:5000/get_image');
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result;
        setImageData(base64data);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.1.4:5000/get_data');
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Fetch Image" onPress={fetchImage} />
      {imageData && <Image source={{ uri: imageData }} style={{ width: 200, height: 200 }} />}
      
      <Button title="Fetch Data" onPress={fetchData} />
      {data && (
        <View>
          <Text>Name: {data.name}</Text>
          <Text>Age: {data.age}</Text>
          <Text>City: {data.city}</Text>
        </View>
      )}
    </View>
  );
};

export default App;
