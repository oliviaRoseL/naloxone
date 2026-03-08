import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { NaloxoneMapListView } from '@/components/naloxone/naloxone-map-list-view';
import { useNaloxoneSearch } from '@/hooks/use-naloxone-search';
import type { AppLocale, NaloxoneDataset } from '@/types/naloxone';

const DATASET = require('../../assets/data/arcgis_locations.json') as NaloxoneDataset;
const MARKER_LIMIT = 250;
const LIST_LIMIT = 25;

function detectLocale(): AppLocale {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationDenied(true);
        return;
      }

      setLocationDenied(false);
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
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