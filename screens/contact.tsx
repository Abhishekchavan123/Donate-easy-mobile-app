// ContactFormOnly.tsx
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
  StatusBar,
} from "react-native";
import { API_URL } from "../api/api";

const BACKEND_URL = `${API_URL}/api/contact`;

interface ContactFormProps {
  onSubmit?: (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    submittedAt: string;
  }) => Promise<void> | void;
  compact?: boolean;
  initialValues?: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
}

const ContactFormOnly = forwardRef<{ reset: () => void }, ContactFormProps>(
  ({ onSubmit, compact = false, initialValues = {} }, ref) => {
    const [name, setName] = useState(initialValues.name || "");
    const [email, setEmail] = useState(initialValues.email || "");
    const [subject, setSubject] = useState(initialValues.subject || "");
    const [message, setMessage] = useState(initialValues.message || "");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const successAnim = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
      reset: () => resetForm(),
    }));

    useEffect(() => {
      if (showSuccess) {
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();

        const t = setTimeout(() => {
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }).start(() => setShowSuccess(false));
        }, 3500);

        return () => clearTimeout(t);
      }
    }, [showSuccess]);

    const validateEmail = (e: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(e);

    const resetForm = () => {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setLoading(false);
      setShowSuccess(false);
    };

    const handleSubmit = async () => {
      if (!name || !email || !subject || !message) {
        Alert.alert("Missing fields", "Please fill all fields.");
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert("Invalid email", "Please enter a valid email.");
        return;
      }

      const payload = {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        submittedAt: new Date().toISOString(),
      };

      Keyboard.dismiss();

      if (onSubmit) {
        try {
          setLoading(true);
          await onSubmit(payload);
          setLoading(false);
          setShowSuccess(true);
          resetForm();
          return;
        } catch (err: any) {
          setLoading(false);
          Alert.alert("Error", err?.message || "Submission failed");
          return;
        }
      }

      try {
        setLoading(true);
        const res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let data: any = null;
        try {
          data = await res.json();
        } catch (_) {}

        setLoading(false);

        if (res.ok) {
          setShowSuccess(true);
          resetForm();
        } else {
          Alert.alert(
            "Submission failed",
            data?.error || data?.message || "Server error"
          );
        }
      } catch (err: any) {
        setLoading(false);
        Alert.alert(
          "Network error",
          "Unable to reach server. Please try again."
        );
      }
    };

    return (
<View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>DonateEasy</Text>
        <TouchableOpacity onPress={() => navigation.navigate('home')}>
          <Text style={styles.navLink}>Home</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
        style={styles.center}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Send Us a Message</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="How can we help?"
            placeholderTextColor="#9ca3af"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your message..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Send Message 🚀</Text>
            )}
          </TouchableOpacity>

          {showSuccess && (
            <Animated.View
              style={[
                styles.successBox,
                {
                  opacity: successAnim,
                  transform: [
                    {
                      translateY: successAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.successText}>
                ✅ Message sent successfully!
              </Text>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
    );
  }
);

export default ContactFormOnly;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  navbar: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#111827',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: '#facc15',
    fontSize: 28,
    fontWeight: '800',
  },
  navLink: {
    color: '#fff',
    fontSize: 16,
  },
  
center: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 28,
    elevation: 10,
  },

  cardTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 18,
    textAlign: "center",
  },

  label: {
    color: "#c7d2fe",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    fontSize: 15,
  },

  textArea: {
    minHeight: 130,
    textAlignVertical: "top",
  },

  submitBtn: {
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#6366f1",
    shadowColor: "#6366f1",
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 6,
  },

  submitDisabled: {
    opacity: 0.6,
  },

  submitText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.4,
  },

  successBox: {
    marginTop: 16,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 14,
  },

  successText: {
    color: "#ffffff",
    fontWeight: "800",
    textAlign: "center",
  },
});
