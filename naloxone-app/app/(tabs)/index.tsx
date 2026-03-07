import React, { useState, useEffect } from "react";
import { Text, View, Button, StyleSheet, ScrollView, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  if (screen === "guide") {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Overdose Response Guide</Text>

        <Text style={styles.step}>1. Check if the person responds.</Text>
        <Text style={styles.step}>2. Call 911 immediately.</Text>
        <Text style={styles.step}>3. Give naloxone if available.</Text>
        <Text style={styles.step}>4. Start rescue breathing.</Text>
        <Text style={styles.step}>5. Stay until emergency help arrives.</Text>

        <Button title="Back" onPress={() => setScreen("home")} />
      </ScrollView>
    );
  }

  if (screen === "map" && location) {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude + 0.01,
              longitude: location.longitude + 0.01,
            }}
            title="Pharmacy (Naloxone Kits)"
          />
        </MapView>

        <Button title="Back" onPress={() => setScreen("home")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Naloxone Assist</Text>

      <Button title="Emergency Guide" onPress={() => setScreen("guide")} />

      <Button title="Find Naloxone Nearby" onPress={() => setScreen("map")} />

      <Button
        title="Call Karandeep"
        color="red"
        onPress={() => Linking.openURL("tel:6475453226")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: "center",
  },
  step: {
    fontSize: 18,
    marginBottom: 20,
  },
});