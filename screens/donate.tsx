import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ImageBackground,
  Modal,
  Pressable
} from 'react-native';
import { API_URL } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

type DonationForm = {
  food_type: string;
  quantity: string;
  expiry_date: string;
  description: string;
  donor_name: string;
  phone_number: string;
  pickup_address: string;
  pickup_time: string;
};

const DonateScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [form, setForm] = useState<DonationForm>({
    food_type: '',
    quantity: '',
    expiry_date: '',
    description: '',
    donor_name: '',
    phone_number: '',
    pickup_address: '',
    pickup_time: '',
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState('User');
  const [menuVisible, setMenuVisible] = useState(false);

  // Load login info
  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        setIsLoggedIn(true);
        const raw = await AsyncStorage.getItem('de_authUser');
        if (raw) {
          const user = JSON.parse(raw);
          setProfileName(user.fullName || user.email || 'User');
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    loadUser();
  }, []);

  const handleChange = (key: keyof DonationForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value } as DonationForm));

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      Alert.alert(
        'Login Required',
        'You must be logged in to submit a donation.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!res.ok) {
        Alert.alert('Error', result.error || 'Donation submission failed');
        return;
      }

      Alert.alert('Success', 'Donation submitted successfully!');
      setForm({
        food_type: '',
        quantity: '',
        expiry_date: '',
        description: '',
        donor_name: '',
        phone_number: '',
        pickup_address: '',
        pickup_time: '',
      });
    } catch (err) {
      Alert.alert('Network Error', 'Please try again later.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('de_authUser');
    setIsLoggedIn(false);
    setMenuVisible(false);
    navigation.replace('Login');
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1593113589675-77323c9fee28?q=80&w=2070&auto=format&fit=crop',
      }}
      style={styles.background}
    >
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>DonateEase</Text>
        {isLoggedIn ? (
          <View>
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.profileButton}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profileName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.profileName}>{profileName}</Text>
            </TouchableOpacity>

            <Modal
              transparent
              visible={menuVisible}
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setMenuVisible(false)}
              >
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate('Dashboard');
                    }}
                  >
                    <Text style={styles.menuItem}>Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate('Profile');
                    }}
                  >
                    <Text style={styles.menuItem}>Edit Profile</Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                  <TouchableOpacity onPress={handleLogout}>
                    <Text style={[styles.menuItem, { color: 'red' }]}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </View>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.navLink}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Donation Form */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formBox}>
          <Text style={styles.sectionTitle}>Food Details</Text>

          <TextInput
            placeholder="Food Type (e.g., Cooked Meals)"
            value={form.food_type}
            onChangeText={(t) => handleChange('food_type', t)}
            style={styles.input}
          />

          <TextInput
            placeholder="Quantity (servings)"
            keyboardType="numeric"
            value={form.quantity}
            onChangeText={(t) => handleChange('quantity', t)}
            style={styles.input}
          />

          <TextInput
            placeholder="Expiry Date/Time (YYYY-MM-DD HH:mm)"
            value={form.expiry_date}
            onChangeText={(t) => handleChange('expiry_date', t)}
            style={styles.input}
          />

          <TextInput
            placeholder="Description"
            multiline
            numberOfLines={3}
            value={form.description}
            onChangeText={(t) => handleChange('description', t)}
            style={[styles.input, { height: 80 }]}
          />

          <Text style={styles.sectionTitle}>Pickup Information</Text>

          <TextInput
            placeholder="Donor Name / Organization"
            value={form.donor_name}
            onChangeText={(t) => handleChange('donor_name', t)}
            style={styles.input}
          />

          <TextInput
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={form.phone_number}
            onChangeText={(t) => handleChange('phone_number', t)}
            style={styles.input}
          />

          <TextInput
            placeholder="Pickup Address"
            multiline
            value={form.pickup_address}
            onChangeText={(t) => handleChange('pickup_address', t)}
            style={[styles.input, { height: 80 }]}
          />

          <TextInput
            placeholder="Available Pickup Times (e.g., 9AM - 6PM)"
            value={form.pickup_time}
            onChangeText={(t) => handleChange('pickup_time', t)}
            style={styles.input}
          />

          <TouchableOpacity onPress={handleSubmit}>
            <LinearGradient
              colors={['#8b5cf6', '#6366f1']}
              style={styles.submitButton}
            >
              <Text style={styles.submitText}>Submit Donation</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default DonateScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  navbar: {
    backgroundColor: 'rgba(21, 128, 61, 0.8)',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  navLink: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  formBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#facc15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'black',
    fontWeight: 'bold',
  },
  profileName: {
    color: 'white',
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: 'white',
    position: 'absolute',
    right: 20,
    top: 60,
    width: 160,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    paddingVertical: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
  },
});
