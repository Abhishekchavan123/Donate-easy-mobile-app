// VolunteerDashboard.js
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function VolunteerDashboard({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [donationStates, setDonationStates] = useState({});
  const [volProfile, setVolProfile] = useState(null);
  const [volStatus, setVolStatus] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem("de_authUser");
      const rawVol = await AsyncStorage.getItem("de_volunteer_profile");
      const states = await AsyncStorage.getItem("de_donation_states");
      if (raw) setVolProfile(JSON.parse(raw));
      if (rawVol) setVolProfile((p) => ({ ...(p || {}), ...(JSON.parse(rawVol) || {}) }));
      if (states) setDonationStates(JSON.parse(states));
      await fetchDonations();
    } catch (e) {
      console.warn("init error", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDonations() {
    try {
      const res = await fetch("http://localhost:4000/api/donations");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDonations(Array.isArray(data.donations) ? data.donations : data.donations || []);
    } catch (err) {
      console.warn("fetchDonations error", err);
      Alert.alert("Failed to load donations", "Ensure backend is running at http://localhost:4000");
      setDonations([]);
    }
  }

  function persistDonationStates(states) {
    setDonationStates(states);
    AsyncStorage.setItem("de_donation_states", JSON.stringify(states)).catch(() => {});
  }

  function getButtonConfig(id) {
    const state = donationStates[String(id)];
    if (!state) return { text: "Accept Task", state: null, nextState: "accepted" };
    if (state === "accepted") return { text: "Picked Up", state: "accepted", nextState: "picked" };
    if (state === "picked") return { text: "Delivered", state: "picked", nextState: "delivered" };
    return { text: "Delivered", state: "delivered", nextState: null };
  }

  async function updateDonationState(id) {
    const cfg = getButtonConfig(id);
    if (!cfg || !cfg.nextState) return;

    if (cfg.nextState === "accepted") setVolStatus("accepted");

    if (cfg.nextState === "delivered") {
      try {
        const url = `http://localhost:4000/api/donations/${id}/status`;
        const resp = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "delivered" }),
        });
        if (!resp.ok) {
          let msg = `Server ${resp.status}`;
          try {
            const d = await resp.json();
            msg = d.error || d.message || msg;
          } catch (_) {}
          throw new Error(msg);
        }
        Alert.alert("Success", "Donation status updated on server");
      } catch (err) {
        console.error("backend update failed", err);
        Alert.alert("Failed to update backend", String(err.message || err));
        return; // abort local update
      }
    }

    const next = { ...donationStates, [String(id)]: cfg.nextState };
    persistDonationStates(next);
    if (cfg.nextState === "delivered") {
      setDonations((prev) => prev.filter((d) => String(d.id) !== String(id)));
    }
    if (cfg.nextState) setVolStatus(cfg.nextState);
  }

  function openMap(address) {
    if (!address) {
      Alert.alert("No address", "Pickup address not available");
      return;
    }
    const q = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) return Linking.openURL(url);
        Alert.alert("Open map", url);
      })
      .catch(() => Alert.alert("Unable to open maps"));
  }

  function pickImageAndUpload() {
    Alert.alert(
      "Upload photo",
      "To enable real image upload install and configure a native image picker (react-native-image-picker or expo-image-picker) and wire this function to upload to your backend."
    );
    // Example local feedback:
    setUploadStatus("Upload feature not enabled");
  }

  function renderDonation({ item }) {
    const cfg = getButtonConfig(item.id);
    const isDelivered = cfg.state === "delivered";
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.donor_name || "—"}</Text>
            <Text style={styles.cardSub}>{item.pickup_address || "—"}</Text>
          </View>
          <Text style={styles.qtyText}>{`${item.quantity || ""} • ${item.food_type || ""}`}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.smallText}>{item.expiry_date || ""}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.mapBtn} onPress={() => openMap(item.pickup_address)}>
              <Text style={styles.mapBtnText}>View on Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isDelivered}
              style={[styles.actionBtn, isDelivered ? styles.actionDisabled : styles.actionPrimary]}
              onPress={() => updateDonationState(item.id)}
            >
              <Text style={styles.actionText}>{cfg.text}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const completedRows = [
    { date: "2024-09-01", donor: "Euwar", distance: "3.2 km", status: "Delivered" },
    { date: "2024-08-28", donor: "Delwian", distance: "1.8 km", status: "Delivered" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <Image source={{ uri: "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/logo1.jpg" }} style={styles.logo} />
          <Text style={styles.brand}>DonateEasy</Text>
        </View>
        <View style={styles.navActions}>
          <TouchableOpacity onPress={() => navigation?.navigate?.("Home")}><Text style={styles.navLink}>Home</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation?.navigate?.("Donate")}><Text style={styles.navLink}>Donate</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation?.navigate?.("Login")}><Text style={styles.navLink}>Login</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.columns}>
          <View style={styles.leftCol}>
            <Text style={styles.sectionTitle}>Active Donations</Text>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={donations}
                keyExtractor={(i) => String(i.id)}
                renderItem={renderDonation}
                ListEmptyComponent={<Text style={{ color: "#6b7280", padding: 20, textAlign: "center" }}>No donations found.</Text>}
              />
            )}
          </View>

          <View style={styles.rightCol}>
            <View style={styles.cardSmall}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitleSmall}>Route</Text>
                <View style={styles.badges}>
                  <View style={styles.badge}><Text style={styles.badgeText}>4 km</Text></View>
                  <View style={styles.badge}><Text style={styles.badgeText}>9 min</Text></View>
                </View>
              </View>
              <View style={styles.mapPlaceholder}><Text style={{ color: "#9CA3AF" }}>Map not available in RN. Use react-native-maps or open external maps.</Text></View>
            </View>

            <View style={styles.cardSmall}>
              <Text style={styles.sectionTitleSmall}>Completed Deliveries</Text>
              {completedRows.map((r, idx) => (
                <View key={idx} style={styles.completedRow}>
                  <Text style={styles.completedCell}>{r.date}</Text>
                  <Text style={styles.completedCell}>{r.donor}</Text>
                  <Text style={styles.completedCell}>{r.distance}</Text>
                  <Text style={[styles.completedCell, { color: "#16A34A" }]}>{r.status}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardSmall}>
              <Text style={styles.sectionTitleSmall}>Task Status</Text>
              {["accepted", "picked", "delivered"].map((s, idx) => {
                const isActive = volStatus === s;
                const isCompleted = volStatus && ["accepted", "picked", "delivered"].indexOf(volStatus) > idx;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusItem, isActive && styles.statusActive, isCompleted && styles.statusCompleted]}
                    onPress={() => {
                      setVolStatus(s);
                      AsyncStorage.setItem("de_volunteer_status", s).catch(()=>{});
                      Alert.alert("Status", s.charAt(0).toUpperCase()+s.slice(1));
                    }}
                  >
                    <View style={[styles.statusDot, (isActive || isCompleted) && { backgroundColor: "#22C55E", borderColor: "#22C55E" }]} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.statusText, isActive && { color: "#2563EB", fontWeight: "700" }]}>{s === "accepted" ? "Accepted" : s === "picked" ? "Picked Up" : "Delivered"}</Text>
                      <Text style={styles.smallText}>{s === "accepted" ? "Task has been accepted" : s === "picked" ? "Item picked up from donor" : "Successfully delivered to recipient"}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={styles.uploadBtn} onPress={pickImageAndUpload}>
                <Text style={{ color: "#fff" }}>Upload Photo</Text>
              </TouchableOpacity>
              {!!uploadStatus && <Text style={[styles.smallText, { marginTop: 8 }]}>{uploadStatus}</Text>}
            </View>

            <View style={styles.cardSmall}>
              <View style={styles.profileRow}>
                <Image style={styles.profileAvatar} source={{ uri: volProfile?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(volProfile?.fullName || volProfile?.email || "User")}` }} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.profileName}>{volProfile?.fullName || "John Doe"}</Text>
                  <Text style={styles.smallText}>{volProfile?.email || ""}</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}><Text style={styles.statNum}>990</Text><Text style={styles.smallText}>Points</Text></View>
                <View style={styles.statItem}><Text style={styles.statNum}>12</Text><Text style={styles.smallText}>Deliveries</Text></View>
                <View style={styles.statItem}><Text style={styles.statNum}>32kg</Text><Text style={styles.smallText}>Donated</Text></View>
              </View>

              <TouchableOpacity style={styles.editBtn} onPress={() => navigation?.navigate?.("Profile")}>
                <Text style={{ color: "#111827" }}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  navbar: { height: 60, backgroundColor: "#16A34A", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  brand: { color: "#FBBF24", fontSize: 20, fontWeight: "800" },
  navActions: { flexDirection: "row", alignItems: "center" },
  navLink: { color: "#fff", marginLeft: 12 },

  container: { padding: 12, alignItems: "center" },
  columns: { width: Math.min(1100, width - 24), flexDirection: "row", alignItems: "flex-start" },
  leftCol: { flex: 1, paddingRight: 8, minWidth: 300 },
  rightCol: { width: 360 },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111827" },
  sectionTitleSmall: { fontSize: 16, fontWeight: "700", color: "#111827" },

  card: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { fontWeight: "700", fontSize: 16, color: "#111827" },
  cardSub: { color: "#6B7280", fontSize: 13 },
  qtyText: { color: "#374151" },
  cardFooter: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  smallText: { fontSize: 12, color: "#6B7280" },

  actionsRow: { flexDirection: "row" },
  mapBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#F3F4F6", marginRight: 8 },
  mapBtnText: { color: "#111827" },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  actionPrimary: { backgroundColor: "#16A34A" },
  actionDisabled: { backgroundColor: "#9CA3AF" },
  actionText: { color: "#fff", fontWeight: "700" },

  cardSmall: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, elevation: 3 },
  badges: { flexDirection: "row" },
  badge: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: "#F3F4F6", borderRadius: 8, marginLeft: 6 },
  badgeText: { fontSize: 12, color: "#111827" },
  mapPlaceholder: { height: 180, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center", marginTop: 10 },

  completedRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  completedCell: { flex: 1, fontSize: 13, color: "#374151" },

  statusItem: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8 },
  statusDot: { width: 14, height: 14, borderRadius: 14, borderWidth: 3, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
  statusText: { color: "#6B7280", fontSize: 14, fontWeight: "600" },
  statusActive: {},
  statusCompleted: {},
  uploadBtn: { marginTop: 8, backgroundColor: "#111827", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: "center" },

  profileRow: { flexDirection: "row", alignItems: "center" },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#D1FAE5" },
  profileName: { fontWeight: "700", fontSize: 16 },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  statItem: { alignItems: "center" },
  statNum: { fontWeight: "700", fontSize: 16 },
  editBtn: { marginTop: 12, backgroundColor: "#F3F4F6", paddingVertical: 8, alignItems: "center", borderRadius: 8 },
});
