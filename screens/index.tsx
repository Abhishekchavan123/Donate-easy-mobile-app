// HomeScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { DrawerActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const WIDTH = width;

const slides = [
  {
    uri:
      "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/bg3.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmczLmpwZyIsImlhdCI6MTc2MTQ0MzcyMiwiZXhwIjoxNzkyOTc5NzIyfQ.gqm65qMNTunq8XwHhdZ6YHmBfIgRJC7j0h9L8Zs3h6U",
  },
  {
    uri:
      "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/bg4.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmc0LmpwZyIsImlhdCI6MTc1OTQ3Mzk5OSwiZXhwIjoxNzkxMDA5OTk5fQ.bIyYiFFbrs7lV238wnF6IVZvLgw7QbqkZAILBRwIAh0",
  },
  { uri: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0" },
];

export default function HomeScreen({ navigation }: any) {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const aboutSectionRef = useRef<View | null>(null);

  const [slideIndex, setSlideIndex] = useState(0);
  const [counters, setCounters] = useState({
    meals: 0,
    ngos: 0,
    donors: 0,
    cities: 0,
  });

  // *** MOVED HOOKS INSIDE COMPONENT (was causing the crash) ***
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("User");
  const [menuVisible, setMenuVisible] = useState(false);

  // Animated fades for slideshow
  const fades = useRef(slides.map(() => new Animated.Value(0))).current;
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // set initial fade states
    fades.forEach((v, i) => v.setValue(i === 0 ? 1 : 0));
    // cycle slideshow
    const startCycle = () => {
      slideTimerRef.current = setInterval(() => {
        setSlideIndex((prev) => {
          const next = (prev + 1) % slides.length;
          // animate crossfade
          Animated.parallel([
            Animated.timing(fades[next], {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(fades[prev], {
              toValue: 0,
              duration: 900,
              useNativeDriver: true,
            }),
          ]).start();
          return next;
        });
      }, 4000);
    };

    startCycle();
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Counter animation effect
  useEffect(() => {
    let i = 0;
    const max = { meals: 10000, ngos: 50, donors: 500, cities: 15 };
    const speed = 50;
    const interval = setInterval(() => {
      i++;
      setCounters({
        meals: Math.min(i * 200, max.meals),
        ngos: Math.min(i, max.ngos),
        donors: Math.min(i * 10, max.donors),
        cities: Math.min(Math.floor(i / 3), max.cities),
      });
      if (i >= 50) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, []);

  // read profile state from storage (call on mount and after login)
  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          setIsLoggedIn(false);
          setProfileName("User");
          return;
        }
        const raw = await AsyncStorage.getItem("de_authUser");
        if (raw) {
          try {
            const u = JSON.parse(raw);
            setProfileName(u.fullName || u.email || "User");
          } catch {
            setProfileName("User");
          }
        }
        setIsLoggedIn(!!token);
      } catch (err) {
        console.warn("init profile read:", err);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("de_authUser");
      setIsLoggedIn(false);
      setMenuVisible(false);
      // replace to Login (adjust route name if your app uses 'login' lowercase)
      if (navigation && typeof navigation.replace === "function") {
        navigation.replace("login");
      } else {
        navigation.navigate("login");
      }
    } catch (err) {
      console.warn("logout error:", err);
    }
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Simple Header with Menu Button */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Icon name="bars" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.logoText}>DonateEasy</Text>
        </View>

        {isLoggedIn ? (
          <View style={styles.profileWrapper}>
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.profileButton}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(profileName && profileName.charAt(0).toUpperCase()) || "U"}
                </Text>
              </View>
              {/* <Text style={styles.profileName} numberOfLines={1}>
                {profileName}
              </Text> */}
            </TouchableOpacity>

            <Modal
              transparent
              visible={menuVisible}
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}
            >
              <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                <View style={styles.dropdown}>
                <View style={styles.dropdownRow} >
                  <Text style={styles.profilename} numberOfLines={1}>
                    {profileName}
                  </Text>
                  <View style={styles.divider} />
                 </View>
                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate("dashboard");
                    }}
                    style={styles.profileMenuItem}
                  >
                     <Icon name="dashboard" size={16} color="#999" />
                    <Text style={styles.menuItem}>Dashboard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate("Profile");
                    }}
                    style={styles.profileMenuItem}
                  >
                    <Icon name="user" size={16} color="#999" />
                    <Text style={styles.menuItem}>Edit Profile</Text>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <TouchableOpacity
                    onPress={() => {
                      setMenuVisible(false);
                      handleLogout();
                    }}
                    style={styles.profileMenuItem}
                  >
                    <Icon name="user" size={16} color="#999" />
                    <Text style={[styles.menuItem, { color: "red" }]}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </View>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate("login")}>
            <Text style={styles.navLink}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slideshow */}
      <View style={styles.slideContainer}>
        {slides.map((s, i) => (
          <Animated.Image
            key={i}
            source={s as any}
            style={[
              StyleSheet.absoluteFillObject,
              { width: width, height: 500, resizeMode: "cover", opacity: fades[i] },
            ]}
            blurRadius={1}
          />
        ))}
        <View style={styles.overlay} />
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Reduce Food Waste,{"\n"}Feed the Hungry</Text>
          <Text style={styles.heroSubtitle}>
            Join our mission to connect surplus food from donors to those in need.
            {"\n"}“Be the reason someone sleeps with a full stomach today.”
          </Text>
          <TouchableOpacity style={styles.donateBtn} onPress={() => navigation.navigate("donate")}>
            <Text style={styles.donateText}>Donate Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Us */}
      <View ref={aboutSectionRef} style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <Text style={styles.sectionText}>
          DonateEasy bridges the gap between food donors and NGOs.
          {"\n\n"}We aim to reduce food waste and feed the hungry using smart technology that connects surplus food from restaurants and individuals to NGOs and volunteers.
          {"\n\n"}Together, we can create a world where no plate is wasted and no person sleeps hungry.
        </Text>
      </View>

      {/* Achievements */}
      <View style={styles.sectionDark}>
        <Text style={styles.sectionTitle}>Our Achievements</Text>
        <View style={styles.counterGrid}>
          <Counter title="Meals Served" value={counters.meals} />
          <Counter title="NGO Partners" value={counters.ngos} />
          <Counter title="Donors Registered" value={counters.donors} />
          <Counter title="Cities Covered" value={counters.cities} />
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.cardContainer}>
          <StepCard
            icon="https://img.icons8.com/color/96/meal.png"
            title="1. Donate Food"
            desc="Individuals, restaurants, or events register surplus food."
          />
          <StepCard
            icon="https://img.icons8.com/color/96/delivery.png"
            title="2. Volunteers Pick Up"
            desc="Verified NGOs and volunteers collect the food quickly."
          />
          <StepCard
            icon="https://img.icons8.com/color/96/charity.png"
            title="3. Distribute to Needy"
            desc="Meals are distributed to shelters and communities."
          />
        </View>
      </View>

      {/* Contact */}
      <View style={styles.sectionDark}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.sectionText}>📧 support@donateeasy.com {"\n"}📞 +91 8050259617</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>DonateEasy</Text>
        <Text style={styles.footerText}>Reducing food waste, feeding the hungry.</Text>
        <Text style={styles.footerCopy}>© 2025 DonateEasy. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

function Counter({ title, value }: { title: string; value: number }) {
  return (
    <View style={styles.counterBox}>
      <Text style={styles.counterValue}>{Math.round(value)}</Text>
      <Text style={styles.counterLabel}>{title}</Text>
    </View>
  );
}

function StepCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.stepCard}>
      <Image source={{ uri: icon }} style={styles.stepIcon} />
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "transparent",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, borderRadius: 8, marginRight: 8 },
  logoText: { fontSize: 28, fontWeight: "700", color: "#facc15" },
  profileWrapper: { flexDirection: "row", alignItems: "center" },
  profileButton: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#facc15", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "black", fontWeight: "bold" },
  profileName: { color: "white", fontSize: 14, marginLeft: 8, maxWidth: 120 },

  dropdown: {
    backgroundColor: "white",
    position: "absolute",
    right: 20,
    top: 60,
    width: 160,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    paddingVertical: 5,
  },
  dropdownRow: { paddingVertical: 6, paddingHorizontal: 12 },
  menuItem: { fontSize: 16, color: "#111" ,marginLeft: 12},
  profilename: { fontSize: 16, fontWeight: "600", color: "#111"},
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 4 },
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


  modalOverlay: { flex: 1 },

  navLink: { color: "white", fontSize: 16 },
  menuButton: { padding: 8 },

  container: { flex: 1, backgroundColor: "#111", paddingTop: 40 },
  slideContainer: { height: 500, position: "relative" },
  slideImage: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  heroTextContainer: { position: "absolute", top: "30%", width: "100%", alignItems: "center", paddingHorizontal: 20 },
  heroTitle: { color: "#FACC15", fontSize: 34, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  heroSubtitle: { color: "#e5e5e5", fontSize: 16, textAlign: "center", marginBottom: 20 },
  donateBtn: { backgroundColor: "#22C55E", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  donateText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  section: { padding: 20, backgroundColor: "#1f1f1f", alignItems: "center" },
  sectionDark: { padding: 20, backgroundColor: "#111", alignItems: "center" },
  sectionTitle: { fontSize: 24, fontWeight: "700", color: "#FACC15", marginBottom: 12 },
  sectionText: { color: "#ddd", textAlign: "center", fontSize: 15, lineHeight: 22 },

  counterGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", width: "100%", marginTop: 10 },
  counterBox: { alignItems: "center", margin: 10 },
  counterValue: { fontSize: 28, fontWeight: "800", color: "#FACC15" },
  counterLabel: { color: "#ccc", marginTop: 4, fontSize: 14 },

  cardContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 12 },
  stepCard: { width: WIDTH / 1.3, backgroundColor: "#222", padding: 20, borderRadius: 16, alignItems: "center", marginVertical: 10, elevation: 4 },
  stepIcon: { width: 80, height: 80, marginBottom: 10 },
  stepTitle: { color: "#FDE047", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  stepDesc: { color: "#ccc", textAlign: "center", fontSize: 14 },

  footer: { backgroundColor: "#0a0a0a", paddingVertical: 24, alignItems: "center", borderTopWidth: 1, borderTopColor: "#222" },
  footerBrand: { color: "#FACC15", fontSize: 22, fontWeight: "700" },
  footerText: { color: "#999", fontSize: 13, marginTop: 6 },
  footerCopy: { color: "#555", fontSize: 12, marginTop: 8 },
});
