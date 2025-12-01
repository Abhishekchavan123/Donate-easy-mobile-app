import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Image, Alert, ScrollView, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid email or password.');
        return;
      }

      if (data.session && data.session.access_token) {
        await AsyncStorage.setItem('access_token', data.session.access_token);
      }

      const meta = data.user?.user_metadata || {};
      const userObj = {
        email: data.user?.email || email,
        fullName: meta.full_name || meta.name || email.split('@')[0],
        role: meta.role || 'user'
      };

      await AsyncStorage.setItem('de_authUser', JSON.stringify(userObj));

      Alert.alert(
        'Login Successful',
        `Welcome ${userObj.fullName} (${userObj.role})`,
        [{ text: 'OK', onPress: () => navigation.navigate("home") }]
      );
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#000000aa', '#000000cc']}
      style={styles.container}
    >
      {/* Background Image Slideshow (simplified single image for RN) */}
      <Image
        source={require('https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/bg3.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmczLmpwZyIsImlhdCI6MTc2MTQ0MzcyMiwiZXhwIjoxNzkyOTc5NzIyfQ.gqm65qMNTunq8XwHhdZ6YHmBfIgRJC7j0h9L8Zs3h6U')}
        style={styles.bgImage}
        blurRadius={3}
      />

      {/* Overlay Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoRow}>
        <Image
          source={{
            uri: "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/logo1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbG9nbzEuanBnIiwiaWF0IjoxNzU5Mjg3MTQwLCJleHAiOjE3OTA4MjMxNDB9.gS6qMW_rieUwiP0yFWKsFhr8J9tyYk5pkoydRr5_d6I",
          }}
          style={styles.logo}
        />
          <Text style={styles.title}>DonateEasy</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login to DonateEasy</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Error Message */}
          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.loginBtn]} onPress={handleLogin}>
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.registerBtn]}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.btnText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 30,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  card: {
    width: '90%',
    backgroundColor: '#ffffffee',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    color: '#16a34a',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#000',
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginBtn: {
    backgroundColor: '#16a34a',
  },
  registerBtn: {
    backgroundColor: '#3b82f6',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
