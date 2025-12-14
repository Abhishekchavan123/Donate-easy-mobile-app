import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { API_URL } from "../api/api";

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert("Missing fields", "Please enter all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      Alert.alert(
        "Success",
        "Registration successful! Please check your email to verify.",
        // [{ text: "OK", onPress: () => navigation.replace("login") }]
      );
      navigateTologin();
    } catch (err) {
      Alert.alert("Network Error", "Please try again.");
    }

    setLoading(false);
  };
  const navigateTologin = () => {
    try {
      // prefer replace if available
      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('login');
        return;
      }

      // reset navigation stack so user cannot go back to login
      if (navigation && typeof navigation.reset === 'function') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'login' }],
        });
        return;
      }

      // fallback
      navigation?.navigate?.('login');
    } catch (err) {
      console.warn('Navigation error:', err);
      navigation?.navigate?.('login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%", alignItems: "center" }}
      >
        {/* Navbar */}
        <View style={styles.navbar}>
          <View style={styles.logoRow}>
            {/* <Image source={require("../assets/logo1.jpg")} style={styles.logo} /> */}
            <Text style={styles.brand}>DonateEasy</Text>
          </View>

          <View style={styles.navLinks}>
            <TouchableOpacity

              onPress={() => {

                navigation.navigate("home");
              }}
            >

              <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Registration Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Register for DonateEase</Text>

          {/* Full Name */}
          <View style={styles.group}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              style={styles.input}
            />
          </View>

          {/* Email */}
          <View style={styles.group}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={styles.group}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              placeholderTextColor="#888"
              style={styles.input}
            />
          </View>

          {/* Role */}
          <View style={styles.group}>
            <Text style={styles.label}>Register As</Text>

            <TouchableOpacity
              style={[styles.roleOption, role === "donor" && styles.roleSelected]}
              onPress={() => setRole("donor")}
            >
              <Text style={styles.roleText}>Donor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, role === "ngo" && styles.roleSelected]}
              onPress={() => setRole("ngo")}
            >
              <Text style={styles.roleText}>NGO</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerTxt}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <Text style={styles.loginText}>
            Already have an account?
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate("login")}
            >
              {" "}
              Login here
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 30,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },

  navbar: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#111827",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  logoRow: { flexDirection: "row", alignItems: "center" },

  logo: { width: 44, height: 44, borderRadius: 8, marginRight: 8 },

  brand: { color: "#FBBF24", fontSize: 24, fontWeight: "800" },

  navLinks: { flexDirection: "row", gap: 16 },

  navText: { color: "#fff", fontSize: 16 },

  card: {
    width: "90%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#2563eb",
    marginBottom: 20,
  },

  group: { marginBottom: 14 },

  label: { color: "#374151", fontWeight: "600", marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },

  roleOption: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },

  roleSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },

  roleText: {
    color: "#1f2937",
    fontWeight: "600",
  },

  registerBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  registerTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },

  loginText: {
    textAlign: "center",
    marginTop: 16,
    color: "#6b7280",
  },

  loginLink: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
