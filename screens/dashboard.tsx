import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { API_URL } from "../api/api";

/* ---------------- TYPES ---------------- */

interface Donation {
  id: string;
  donor_name: string;
  pickup_address: string;
  quantity: string;
  food_type: string;
}

type DonationState = "accepted" | "picked" | "delivered";
type DonationStateMap = Record<string, DonationState>;

/* ---------------- COMPONENT ---------------- */

export default function VolunteerDashboard({ navigation }: any) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [states, setStates] = useState<DonationStateMap>({});
  const [loading, setLoading] = useState(false);

  const locationSub = useRef<Location.LocationSubscription | null>(null);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    fetchDonations();
    return stopLocationTracking;
  }, []);

  /* ---------------- FETCH ---------------- */

  async function fetchDonations() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/donations`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setDonations(data?.donations || []);
    } catch (err) {
      Alert.alert("Error", "Unable to fetch donations");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- STATE FLOW ---------------- */

  function getNextState(id: string): DonationState | null {
    const current = states[id];
    if (!current) return "accepted";
    if (current === "accepted") return "picked";
    if (current === "picked") return "delivered";
    return null;
  }

  /* ---------------- LOCATION ---------------- */

  async function startLocationTracking() {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Enable location access");
        return;
      }

      if (!locationSub.current) {
        locationSub.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          () => { }
        );
      }
    } catch {
      Alert.alert("Error", "Location tracking failed");
    }
  }

  function stopLocationTracking() {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
  }

  /* ---------------- UPDATE STATUS ---------------- */

  async function updateDonationState(donation: Donation) {
    const next = getNextState(donation.id);
    if (!next) return;

    try {
      if (next === "accepted") {
        await startLocationTracking();
      }

      if (next === "delivered") {
        const res = await fetch(
          `${API_URL}/api/donations/${donation.id}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "delivered" }),
          }
        );

        if (!res.ok) throw new Error("Update failed");
        stopLocationTracking();
      }

      const updated = { ...states, [donation.id]: next };
      setStates(updated);
      await AsyncStorage.setItem(
        "de_donation_states",
        JSON.stringify(updated)
      );

      if (next === "delivered") {
        setDonations((prev) =>
          prev.filter((d) => d.id !== donation.id)
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  }

  /* ---------------- MAP ---------------- */

  async function openMap(address: string) {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const url = `https://www.google.com/maps/dir/?api=1&origin=${loc.coords.latitude},${loc.coords.longitude}&destination=${encodeURIComponent(
        address
      )}`;
      Linking.openURL(url);
    } catch {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address
        )}`
      );
    }
  }

  /* ---------------- RENDER ITEM ---------------- */

  function renderItem({ item }: { item: Donation }) {
    const state = states[item.id];
    const label =
      !state ? "Accept Task" : state === "accepted" ? "Picked Up" : "Delivered";

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.donor_name}</Text>
        <Text style={styles.sub}>{item.pickup_address}</Text>
        <Text style={styles.sub}>
          {item.quantity} • {item.food_type}
        </Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => openMap(item.pickup_address)}
          >
            <Text>View Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => updateDonationState(item)}
          >
            <Text style={styles.actionText}>{label}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#111827" />
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.brand}>DonateEasy</Text>
        <TouchableOpacity onPress={() => navigation.navigate("home")}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.header}>Active Donations</Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={donations}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<Text>No donations found</Text>}
          />
        )}
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#F3F4F6" },
  header: { fontSize: 22, fontWeight: "800", marginBottom: 12 },

   navbar: {
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#111827",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
logoText: { fontSize: 28, fontWeight: "700", color: "#facc15" },
  navLink: {
    color: 'white',
    fontSize: 16,
  },

  logoRow: { flexDirection: "row", alignItems: "center" },

  logo: { width: 44, height: 44, borderRadius: 8, marginRight: 8 },

  brand: { color: "#FBBF24", fontSize: 28, fontWeight: "800" },

  navLinks: { flexDirection: "row", gap: 16 },

  navText: { color: "#fff", fontSize: 16 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: { fontWeight: "700", fontSize: 16 },
  sub: { color: "#6B7280", marginTop: 4 },
  row: { flexDirection: "row", marginTop: 10 },

  mapBtn: {
    backgroundColor: "#E5E7EB",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  actionBtn: {
    backgroundColor: "#16A34A",
    padding: 8,
    borderRadius: 8,
  },
  actionText: { color: "#fff", fontWeight: "700" },
});
