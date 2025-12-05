// DonateEaseRegister.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

// Correct API URL for both Android emulator & iOS/Metro
const API_URL ="http://localhost:4000";

export default function DonateEaseRegister({ navigation }:any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim() || !email.trim() || !password || !role) {
      Alert.alert("Error", "Please enter name, email, password and select role.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert("Error", data.error || "Registration failed");
        setLoading(false);
        return;
      }

      Alert.alert(
        "Success",
        data.message || "Registration successful! Please check your email.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
    } catch (err) {
      console.error("Register error:", err);
      Alert.alert("Network Error", "Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heading}>Register for DonateEase</Text>

          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Role Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Register As</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleButton, role === "donor" && styles.roleButtonActive]}
                onPress={() => setRole("donor")}
                disabled={loading}
              >
                <Text style={[styles.roleText, role === "donor" && styles.roleTextActive]}>
                  Donor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, role === "ngo" && styles.roleButtonActive]}
                onPress={() => setRole("ngo")}
                disabled={loading}
              >
                <Text style={[styles.roleText, role === "ngo" && styles.roleTextActive]}>
                  NGO
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Register</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
              Login here
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles ---------------------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f3f4f6" },
  container: {
    paddingTop: 150,
    paddingBottom: 50,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 6,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#2563EB",
    marginBottom: 16,
  },
  field: { marginBottom: 12 },
  label: { color: "#374151", marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  roleRow: { flexDirection: "row", justifyContent: "space-between" },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
  },
  roleButtonActive: {
    backgroundColor: "#E0F2FE",
    borderColor: "#60A5FA",
  },
  roleText: { fontWeight: "600", color: "#374151" },
  roleTextActive: { color: "#1D4ED8" },
  submit: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontWeight: "700" },
  footerText: {
    marginTop: 12,
    textAlign: "center",
    color: "#6B7280",
  },
  loginLink: { color: "#2563EB", textDecorationLine: "underline" },
});
