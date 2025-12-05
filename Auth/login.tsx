// LoginScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { API_URL } from "../config";

type Props = {
  navigation?: any;
};

const { width, height } = Dimensions.get("window");
const SLIDE_INTERVAL_MS = 5000; // 5s each

const slides = [
  {
    uri:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1950&q=80",
  },
];

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animated opacities for crossfade
  const opacityVals = useRef(
    slides.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;

  const currentIndex = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length > 1) {
      intervalRef.current = setInterval(() => {
        const next = (currentIndex.current + 1) % slides.length;
        crossfadeTo(next);
        currentIndex.current = next;
      }, SLIDE_INTERVAL_MS);

      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
    // nothing to cleanup if only one slide
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crossfadeTo = (index: number) => {
    const animations = slides.map((_, i) =>
      Animated.timing(opacityVals[i], {
        toValue: i === index ? 1 : 0,
        duration: 800,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  };

  const getBaseUrl = () => {
    if (API_URL && API_URL.length) return API_URL;
    // fallback for Android emulator
    if (Platform.OS === "android") {
      return "http://10.0.2.2:4000";
    }
    return "http://localhost:4000";
  };

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password.");
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/api/auth/login`;

      // using axios for consistent handling
      const resp = await axios.post(
        url,
        { email, password },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );

      const data = resp.data;

      if (resp.status >= 200 && resp.status < 300 && data?.access_token) {
        await AsyncStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          await AsyncStorage.setItem("refresh_token", data.refresh_token);
        }
        navigation?.navigate("home");
      } else {
        const msg = data?.message || "Login failed.";
        setError(msg);
        Alert.alert("Error", msg);
      }
    } catch (err: any) {
      console.error("[SignIn] Error:", err);

      // axios error shape handling
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to connect to server.";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNav = () => {
    navigation?.navigate("register");
  };

  return (
    <View style={styles.screen}>
      {/* Slideshow */}
      <View style={styles.slideshow}>
        {slides.map((src, i) => (
          <Animated.Image
            key={i}
            source={src as any}
            style={[styles.slide, { opacity: opacityVals[i] }]}
            resizeMode="cover"
            accessible={false}
          />
        ))}
      </View>

      <View style={styles.overlay} pointerEvents="none" />

      <View style={styles.navbar}>
        <View style={styles.brand}>
          <Text style={styles.brandText}>
            <Text style={styles.brandAccent}>Donate</Text>Easy
          </Text>
        </View>

        <View style={styles.navLinks}>
          <Text style={styles.navLink}>Home</Text>
          <Text style={styles.navLink}>Join as NGO</Text>
          <Text style={styles.navLink}>Contact</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.centerContainer}
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Login to DonateEasy</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#666"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              textContentType="password"
            />
          </View>

          {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.registerBtn]} onPress={handleRegisterNav} disabled={loading}>
              <Text style={styles.btnText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  slideshow: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -2,
  },
  slide: {
    width,
    height,
    position: "absolute",
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: -1,
  },

  navbar: {
    marginTop: Platform.OS === "ios" ? 50 : 20,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandText: {
    color: "#F9FAFB",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
  },
  brandAccent: {
    color: "#FDE047",
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  navLink: {
    color: "#fff",
    marginLeft: 12,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 20,
    borderRadius: 12,
    elevation: 8,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#059669",
    marginBottom: 14,
  },

  field: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },

  errorMsg: {
    color: "#dc2626",
    marginBottom: 10,
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  loginBtn: {
    backgroundColor: "#10B981",
  },
  registerBtn: {
    backgroundColor: "#3B82F6",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.7,
  },
});
