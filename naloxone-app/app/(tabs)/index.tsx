import React, { useState, useEffect } from "react";
import { Text, View, Button, StyleSheet, ScrollView, Linking, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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
      <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
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
        {Platform.OS !== "web" ? (
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
        ) : (
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            Map is only available on iOS/Android
          </Text>
        )}
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
        title="Call 911"
        color="red"
        onPress={() => Linking.openURL("tel:911")}
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