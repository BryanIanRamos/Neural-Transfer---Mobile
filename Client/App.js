import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import icons from Expo

import HomeScreen from "./Routes/HomeScreen";
import Neural from "./Routes/Neural";
import Result from "./Routes/Result";
import { FontAwesome5 } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="History" component={HomeScreen} />
      {/* <Stack.Screen name="Details" component={HomeScreen} /> */}
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Neural"
        component={Neural}
        options={{ title: "Neural Transfer" }}
      />
      <Stack.Screen name="Result" component={Result} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Generate") {
              iconName = "magic"; // Assign the icon name
            }

            // Return the appropriate icon component based on the iconName
            if (iconName === "magic") {
              return <FontAwesome5 name="magic" size={size} color={color} />;
            } else {
              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
            }
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Generate"
          component={ProfileStack}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
