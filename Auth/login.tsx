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
  Image,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  navigation?: any;
};

const { width, height } = Dimensions.get("window");

const SLIDE_INTERVAL_MS = 5000; // 5s each (as in your HTML timing)

const slides = [
  // local images (ensure these exist in your project) or remote URIs
 
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

  // animated opacities for crossfade
  const opacityVals = useRef(slides.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const currentIndex = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // start slideshow
    intervalRef.current = global.setInterval(() => {
      const next = (currentIndex.current + 1) % slides.length;
      crossfadeTo(next);
      currentIndex.current = next;
    }, SLIDE_INTERVAL_MS);

    return () => {
      // cleanup
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crossfadeTo = (index: number) => {
    // fade up the target to 1 and others to 0
    const animations: Animated.CompositeAnimation[] = slides.map((_, i) =>
      Animated.timing(opacityVals[i], {
        toValue: i === index ? 1 : 0,
        duration: 800,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  };

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return false;
    }
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      // NOTE: On a physical device, `localhost` refers to the device itself.
      // Use your machine IP (e.g. http://192.168.x.x:4000) or ngrok for testing on device.
      // Replace 192.168.x.x with your actual machine IP address
      const API_URL = __DEV__ ? "http://YOUR_MACHINE_IP:4000" : "http://localhost:4000";
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // store token if present (matches your HTML)
      if (data.session && data.session.access_token) {
        await AsyncStorage.setItem("access_token", data.session.access_token);
      }

      try {
        const meta = data.user && data.user.user_metadata ? data.user.user_metadata : {};
        const fullName = meta.full_name || meta.name || "";
        const role = meta.role || "user";
        const userObj = {
          email: (data.user && data.user.email) || email.trim(),
          fullName: fullName || (email && email.split("@")[0]) || "User",
          role,
        };
        await AsyncStorage.setItem("de_authUser", JSON.stringify(userObj));

        Alert.alert("Login successful!", `Welcome ${userObj.fullName} (${userObj.role})`, [
          {
            text: "OK",
            onPress: () => {
              setEmail("");
              setPassword("");
              // navigate to Home (ensure route exists)
              navigation?.navigate("Home");
            },
          },
        ]);
      } catch (storeErr) {
        console.warn("Failed to store user data:", storeErr);
        Alert.alert("Login successful", "But could not store some user data locally.");
        navigation?.navigate("Home");
      }

      setLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleRegisterNav = () => {
    navigation?.navigate("register");
  };

  return (
    <View style={styles.screen}>
      {/* Slideshow: stack Animated.Image components */}
      <View style={styles.slideshow}>
        {slides.map((src, i) => (
          <Animated.Image
            key={i}
            source={src as any}
            style={[
              styles.slide,
              {
                opacity: opacityVals[i],
              },
            ]}
            resizeMode="cover"
            accessible={false}
          />
        ))}
      </View>

      {/* Dark overlay */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Navbar (simple) */}
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

      {/* Centered login card */}
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
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.registerBtn]}
              onPress={handleRegisterNav}
              disabled={loading}
            >
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
  logo: {
    width: 40,
    height: 40,
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
    backgroundColor: "rgba(255,255,255,0.95)", // like bg-white bg-opacity-95
    padding: 20,
    borderRadius: 12,
    elevation: 8,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#059669", // green-600
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
    gap: 8,
    // for older RN versions that don't support gap:
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
    backgroundColor: "#10B981", // green-500
  },
  registerBtn: {
    backgroundColor: "#3B82F6", // blue-500
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.7,
  },
});
