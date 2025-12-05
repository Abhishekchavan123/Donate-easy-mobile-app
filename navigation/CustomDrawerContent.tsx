// CustomDrawerContent.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type Props = {
  navigation: any;
  state?: any;
};

const LOGO_URI =
  "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/public/assets/logo1.jpg";

const CustomDrawerContent = (props: Props) => {
  const { navigation } = props;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileName, setProfileName] = useState("User");

  // ref to store unsubscribe fns so we can clean up
  const unsubscribesRef = useRef<any[]>([]);

  // Reads tokens + user info from AsyncStorage and updates UI state
  const refreshProfileFromStorage = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        setIsLoggedIn(false);
        setProfileName("User");
        return;
      }

      // if token exists, try to read stored user info
      let displayName = "User";
      const raw = await AsyncStorage.getItem("de_authUser");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          displayName = (u.fullName || u.email || "User");
        } catch (err) {
          console.warn("Failed to parse de_authUser:", err);
        }
      }
      setProfileName(displayName);
      setIsLoggedIn(true);
    } catch (err) {
      console.warn("refreshProfileFromStorage error:", err);
      setIsLoggedIn(false);
      setProfileName("User");
    }
  };

  // Run once on mount
  useEffect(() => {
    refreshProfileFromStorage();

    // Add navigation listeners so drawer refreshes at useful moments:
    // - when drawer opens
    // - when parent navigator state changes (covers navigation.replace/reset)
    // - when screen gains focus
    // We store unsubscribe functions to cleanup on unmount.

    // drawerOpen - fired when drawer opens in many RN versions
    try {
      const u1 = navigation.addListener && navigation.addListener("drawerOpen", () => {
        refreshProfileFromStorage();
      });
      if (u1) unsubscribesRef.current.push(u1);
    } catch (err) {
      // ignore if event not supported
    }

    // focus - if the drawer container gains focus
    try {
      const u2 = navigation.addListener && navigation.addListener("focus", () => {
        refreshProfileFromStorage();
      });
      if (u2) unsubscribesRef.current.push(u2);
    } catch (err) {}

    // state - listen for any navigation state change (triggered after navigation.replace/reset)
    try {
      const u3 = navigation.addListener && navigation.addListener("state", () => {
        refreshProfileFromStorage();
      });
      if (u3) unsubscribesRef.current.push(u3);
    } catch (err) {}

    return () => {
      // cleanup listeners
      unsubscribesRef.current.forEach((unsub) => {
        try {
          if (typeof unsub === "function") unsub();
          else if (unsub && typeof unsub.remove === "function") unsub.remove();
        } catch (e) {}
      });
      unsubscribesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also refresh whenever this drawer/screen is focused (keeps UI in sync)
  useFocusEffect(
    useCallback(() => {
      refreshProfileFromStorage();
    }, [])
  );

  const handleLogout = async () => {
    try {
      // Confirm first
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("access_token");
            await AsyncStorage.removeItem("refresh_token");
            await AsyncStorage.removeItem("de_authUser");
            setIsLoggedIn(false);
            setDropdownVisible(false);
            setProfileName("User");
            // navigate to login screen and close drawer
            navigation.navigate("login");
            navigation.closeDrawer();
          },
        },
      ]);
    } catch (err) {
      console.warn("logout error:", err);
    }
  };

  const handleNavigate = (routeName: string) => {
    navigation.navigate(routeName);
    navigation.closeDrawer();
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
            uri: LOGO_URI,
          }}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>DonateEasy</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate("home")}
        >
          <Icon name="home" size={20} color="#facc15" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate("donate")}
        >
          <Icon name="gift" size={20} color="#facc15" />
          <Text style={styles.menuText}>Donate Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate("ngo-form")}
        >
          <Icon name="handshake-o" size={20} color="#facc15" />
          <Text style={styles.menuText}>Join as NGO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("about")}>
          <Icon name="info-circle" size={20} color="#facc15" />
          <Text style={styles.menuText}>About Us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate("contact")}
        >
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
            navigation.navigate("login");
            navigation.closeDrawer();
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
                {profileName ? profileName.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileName}</Text>
              <Text style={styles.profileSubtext}>View Profile</Text>
            </View>
            <Icon
              name={dropdownVisible ? "chevron-up" : "chevron-down"}
              size={16}
              color="#facc15"
            />
          </TouchableOpacity>

          {dropdownVisible && (
            <View style={styles.profileMenu}>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => handleNavigate("dashboard")}
              >
                <Icon name="dashboard" size={16} color="#999" />
                <Text style={styles.profileMenuText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => handleNavigate("Profile")}
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
                <Text style={[styles.profileMenuText, { color: "#ff6b6b" }]}>
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
    backgroundColor: "#1f1f1f",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
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
    fontWeight: "bold",
    color: "#facc15",
  },
  menuSection: {
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 12,
    marginHorizontal: 16,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.8)",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  authButtonText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 16,
    fontWeight: "600",
  },
  profileSection: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#facc15",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 16,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  profileSubtext: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  profileMenu: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    overflow: "hidden",
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  profileMenuText: {
    color: "#999",
    fontSize: 14,
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 4,
  },
});
