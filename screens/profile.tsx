import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/api';

 // ⚠️ change for physical device

type Props = {
  navigation: any;
};

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      try {
        const raw = await AsyncStorage.getItem('de_authUser');
        if (raw) {
          const user = JSON.parse(raw);
          setFullName(user.fullName || '');
          setEmail(user.email || '');
        }
      } catch (e) {
        console.warn('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Please enter full name');
      return;
    }

    setSaving(true);

    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: fullName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.error || 'Failed to update profile');
        setSaving(false);
        return;
      }

      // update local storage
      const updatedUser = {
        email,
        fullName: fullName.trim(),
        role: data.role || 'user',
      };
      await AsyncStorage.setItem('de_authUser', JSON.stringify(updatedUser));

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Dashboard'),
        },
      ]);
    } catch (e) {
      Alert.alert('Network Error', 'Please try again later');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

      {/* Card */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
      <View style={styles.card}>
        <Text style={styles.title}>Edit Profile</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          placeholder="Enter full name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          editable={false}
          style={[styles.input, styles.disabled]}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfileScreen;

/* ---------------- STYLES ---------------- */
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
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  disabled: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
