// ContactFormOnly.js
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
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
} from "react-native";

/**
 * Props:
 * - onSubmit(payload) : optional async function called with the form payload. If provided, component will await it.
 * - compact: boolean -> if true, removes SafeArea-like paddings making it embeddable in other layouts.
 * - initialValues: { name, email, subject, message }
 *
 * Exposed methods via ref:
 * - reset() : resets the form
 *
 * Usage:
 * const ref = useRef();
 * <ContactFormOnly ref={ref} onSubmit={async (p)=>{ ... }} compact />
 * ref.current.reset()
 */
const ContactFormOnly = forwardRef(({ onSubmit, compact = false, initialValues = {} }, ref) => {
  const [name, setName] = useState(initialValues.name || "");
  const [email, setEmail] = useState(initialValues.email || "");
  const [subject, setSubject] = useState(initialValues.subject || "");
  const [message, setMessage] = useState(initialValues.message || "");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  // expose reset to parent via ref
  useImperativeHandle(ref, () => ({
    reset: () => resetForm(),
  }));

  useEffect(() => {
    if (showSuccess) {
      Animated.timing(successAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      const t = setTimeout(() => {
        Animated.timing(successAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
          setShowSuccess(false);
        });
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [showSuccess, successAnim]);

  const validateEmail = (e) => {
    // conservative, robust check
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(e);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setLoading(false);
    setShowSuccess(false);
  };

  const handleSubmit = async () => {
    // quick client-side validation
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert("Missing fields", "Please fill all fields before submitting.");
      return;
    }
    if (!validateEmail(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    // hide keyboard
    Keyboard.dismiss();

    // If caller provided onSubmit, await it. Show loading.
    if (onSubmit && typeof onSubmit === "function") {
      try {
        setLoading(true);
        // allow onSubmit to be sync or async
        const result = onSubmit(payload);
        if (result && typeof result.then === "function") {
          await result;
        }
        setLoading(false);
        setShowSuccess(true);
        resetForm();
        return;
      } catch (err) {
        setLoading(false);
        console.warn("onSubmit error:", err);
        Alert.alert("Submission error", err?.message || "Failed to submit. Try again.");
        return;
      }
    }

    // frontend-only fallback: log + show success
    console.log("CONTACT FORM (local):", payload);
    setShowSuccess(true);
    resetForm();
  };

  // compact mode reduces outer paddings for embedding
  const containerStyle = compact ? styles.containerCompact : styles.container;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={containerStyle}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.cardTitle}>
          Send Us a Message
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          accessible
          accessibilityLabel="Full name"
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          accessible
          accessibilityLabel="Email address"
        />

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="How can we help?"
          placeholderTextColor="#9ca3af"
          value={subject}
          onChangeText={setSubject}
          returnKeyType="next"
          accessible
          accessibilityLabel="Subject"
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your message here..."
          placeholderTextColor="#9ca3af"
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          returnKeyType="done"
          accessible
          accessibilityLabel="Message"
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Send Message"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Send Message ✉</Text>
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
                      outputRange: [8, 0],
                    }),
                  },
                ],
              },
            ]}
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.successText}>
              ✅ Thank you! Your message has been received.
            </Text>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
});

export default ContactFormOnly;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  containerCompact: {
    padding: 0,
    backgroundColor: "transparent",
  },
  card: {
    backgroundColor: "#0b1220",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(102,126,234,0.06)",
  },
  cardTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 12 },

  label: { color: "#dbe7ff", fontWeight: "700", marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.08)",
    fontSize: 15,
  },
  textArea: { minHeight: 120 },

  submitBtn: {
    marginTop: 14,
    backgroundColor: "#667eea",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
  },
  submitDisabled: { opacity: 0.7 },

  submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  successBox: {
    marginTop: 12,
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  successText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
