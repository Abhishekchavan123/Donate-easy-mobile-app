// LoginScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart'; // <- production restart
import { API_URL } from 'api/api';

type Props = {
  navigation?: any;
};

const { width, height } = Dimensions.get('window');
const Api = "https://donateeasy-backend.onrender.com/";

const IMAGES = [
  { uri: 'https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/bg3.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmczLmpwZyIsImlhdCI6MTc2MTQ0MzcyMiwiZXhwIjoxNzkyOTc5NzIyfQ.gqm65qMNTunq8XwHhdZ6YHmBfIgRJC7j0h9L8Zs3h6U' },
  { uri: 'https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/bg4.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmc0LmpwZyIsImlhdCI6MTc1OTQ3Mzk5OSwiZXhwIjoxNzkxMDA5OTk5fQ.bIyYiFFbrs7lV238wnF6IVZvLgw7QbqkZAILBRwIAh0' },
  { uri: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1950&q=80' },
];

export default function LoginScreen({ navigation }: Props) {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animated values for crossfade
  const fades = useRef(IMAGES.map(() => new Animated.Value(0))).current;
  const currentIndex = useRef(0);
  const cycleTimer = useRef<number | null>(null);

  useEffect(() => {
    fades.forEach((v, i) => v.setValue(i === 0 ? 1 : 0));

    const cycle = () => {
      const next = (currentIndex.current + 1) % IMAGES.length;

      Animated.parallel([
        Animated.timing(fades[next], {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fades[currentIndex.current], {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        currentIndex.current = next;
        cycleTimer.current = setTimeout(cycle, 3000) as any;
      });
    };

    cycleTimer.current = setTimeout(cycle, 3000) as any;

    return () => {
      if (cycleTimer.current) clearTimeout(cycleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // production restart (requires react-native-restart installed & native rebuild)
  const restartApplication = () => {
    try {
      RNRestart.Restart();
    } catch (e) {
      // If restart fails (shouldn't when installed and rebuilt), fallback to navigation reset
      console.warn('RNRestart failed, falling back to navigation reset', e);
      try {
        navigation?.reset?.({ index: 0, routes: [{ name: 'home' }] });
      } catch (_) {
        navigation?.navigate?.('home');
      }
    }
  };

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      // Use device-local host for emulator; change URL according to env
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          `Login failed (status ${res.status})`;
        setError(msg);
        setLoading(false);
        return;
      }

      const token =
        data?.session?.access_token || data?.access_token || data?.token || null;

      if (token) {
        await AsyncStorage.setItem('access_token', token);
      }

      const userFromResp =
        data?.user || data?.session?.user || (data && data.user ? data.user : null);

      let userObj: any = {
        email: email.trim(),
        fullName: email.trim().split('@')[0],
        role: 'user',
      };

      if (userFromResp) {
        const meta = userFromResp.user_metadata || userFromResp.metadata || {};
        const fullName = meta.full_name || meta.name || userFromResp.fullName || userFromResp.name || userFromResp.email;
        const role = meta.role || userFromResp.role || 'user';
        userObj = {
          email: userFromResp.email || userObj.email,
          fullName: fullName || userObj.fullName,
          role,
        };
      }

      try {
        await AsyncStorage.setItem('de_authUser', JSON.stringify(userObj));
      } catch (err) {
        console.warn('Failed to store user object', err);
      }

      // show brief success and then perform production restart
      Alert.alert('Login successful', `Welcome ${userObj.fullName}`, [
        {
          text: 'OK',
          onPress: () => {
            // short timeout ensures alert dismissed then restart
            setTimeout(() => restartApplication(), 150);
          },
        },
      ]);
    } catch (err: any) {
      console.warn('Login network error', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background slideshow (absolute) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {IMAGES.map((img, i) => (
          <Animated.Image
            key={i}
            source={img as any}
            style={[
              StyleSheet.absoluteFill,
              { width, height, resizeMode: 'cover', opacity: fades[i] },
            ]}
            blurRadius={1}
          />
        ))}
        <View style={styles.darkOverlay} />
      </View>

      {/* Navbar (simplified) */}
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>DonateEasy</Text>
        </View>
        <View style={styles.navLinks}>
          <TouchableOpacity
            style={styles.navText}
            onPress={() => {
            
              navigation.navigate("home");}}
          >
            
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

      </View>
    </View>

      {/* Centered login box */ }
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
    <View style={styles.card}>
      <Text style={styles.title}>Login to DonateEasy</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter your email"
          placeholderTextColor="#999"
          style={styles.input}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter password"
          placeholderTextColor="#999"
          style={styles.input}
          editable={!loading}
        />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginTxt}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => navigation && navigation.navigate ? navigation.navigate('register') : null}
          disabled={loading}
        >
          <Text style={styles.registerTxt}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAvoidingView>
    </View> 
  );
}

/* styles unchanged from your version */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  navbar: {
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 44, height: 44, borderRadius: 8, marginRight: 8 },
  brand: { color: '#FBBF24', fontSize: 22, fontWeight: '800' },
  navLinks: { flexDirection: 'row', gap: 14 },
  navText: { color: '#fff', marginHorizontal: 8, fontSize: 16 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.96)',
    padding: 22,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  title: { fontSize: 20, color: '#047857', fontWeight: '700', textAlign: 'center', marginBottom: 14 },
  inputGroup: { marginBottom: 12 },
  label: { color: '#374151', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  error: { color: '#DC2626', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', marginTop: 6, gap: 10 },
  loginBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  loginTxt: { color: '#fff', fontWeight: '700' },
  registerBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  registerTxt: { color: '#fff', fontWeight: '700' },
});
