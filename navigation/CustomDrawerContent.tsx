import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome';

const CustomDrawerContent = (props: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileName, setProfileName] = useState('User');

  const handleLogout = () => {
    setIsLoggedIn(false);
    setDropdownVisible(false);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
      scrollEnabled={false}
    >
      {/* Header Section */}
      <View style={styles.drawerHeader}>
        <Image
          source={{
            uri: 'https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/logo1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbG9nbzEuanBnIiwiaWF0IjoxNzU5Mjg3MTQwLCJleHAiOjE3OTA4MjMxNDB9.gS6qMW_rieUwiP0yFWKsFhr8J9tyYk5pkoydRr5_d6I',
          }}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>DonateEasy</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            props.navigation.navigate('home');
            props.navigation.closeDrawer();
          }}
        >
          <Icon name="home" size={20} color="#facc15" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            props.navigation.navigate('donate');
            props.navigation.closeDrawer();
          }}
        >
          <Icon name="gift" size={20} color="#facc15" />
          <Text style={styles.menuText}>Donate Food</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="handshake-o" size={20} color="#facc15" />
          <Text style={styles.menuText}>Join as NGO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="info-circle" size={20} color="#facc15" />
          <Text style={styles.menuText}>About Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="phone" size={20} color="#facc15" />
          <Text style={styles.menuText}>Contact Us</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Auth Section */}
      {!isLoggedIn ? (
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => {
            props.navigation.navigate('login');
            props.navigation.closeDrawer();
          }}
        >
          <Icon name="sign-in" size={20} color="#fff" />
          <Text style={styles.authButtonText}>Login / Register</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileHeader}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>
                {profileName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileName}</Text>
              <Text style={styles.profileSubtext}>View Profile</Text>
            </View>
            <Icon
              name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#facc15"
            />
          </TouchableOpacity>

          {dropdownVisible && (
            <View style={styles.profileMenu}>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  props.navigation.navigate('Dashboard');
                  props.navigation.closeDrawer();
                }}
              >
                <Icon name="dashboard" size={16} color="#999" />
                <Text style={styles.profileMenuText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  props.navigation.navigate('Profile');
                  props.navigation.closeDrawer();
                }}
              >
                <Icon name="user" size={16} color="#999" />
                <Text style={styles.profileMenuText}>Edit Profile</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={handleLogout}
              >
                <Icon name="sign-out" size={16} color="#ff6b6b" />
                <Text style={[styles.profileMenuText, { color: '#ff6b6b' }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#facc15',
  },
  menuSection: {
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  authButtonText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 16,
    fontWeight: '600',
  },
  profileSection: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileSubtext: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  profileMenu: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  profileMenuText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
});
