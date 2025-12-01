import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";



const WIDTH = Dimensions.get("window").width;

const slides = [
  { uri: "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/bg3.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmczLmpwZyIsImlhdCI6MTc2MTQ0MzcyMiwiZXhwIjoxNzkyOTc5NzIyfQ.gqm65qMNTunq8XwHhdZ6YHmBfIgRJC7j0h9L8Zs3h6U" },
  { uri: "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/bg4.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmc0LmpwZyIsImlhdCI6MTc1OTQ3Mzk5OSwiZXhwIjoxNzkxMDA5OTk5fQ.bIyYiFFbrs7lV238wnF6IVZvLgw7QbqkZAILBRwIAh0" },
  { uri: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0" },
];

export default function HomeScreen({ navigation }: any) {
  const scrollViewRef = useRef<ScrollView>(null);
  const aboutSectionRef = useRef<View>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [counters, setCounters] = useState({
    meals: 0,
    ngos: 0,
    donors: 0,
    cities: 0,
  });

// slideshow and counters effects need to run from HomeScreen (not only inside Navbar)
// Copy effects here so they execute even if Navbar component isn't mounted/used.
useEffect(() => {
  const timer = setInterval(() => {
    setSlideIndex((prev) => (prev + 1) % slides.length);
  }, 4000);
  return () => clearInterval(timer);
}, []);

// Counter animation
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
      cities: Math.min(i / 3, max.cities),
    });
    if (i >= 50) clearInterval(interval);
  }, speed);
  return () => clearInterval(interval);
}, []);

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
      {/* Simple Header with Menu Button */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/logo1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvbG9nbzEuanBnIiwiaWF0IjoxNzU5Mjg3MTQwLCJleHAiOjE3OTA4MjMxNDB9.gS6qMW_rieUwiP0yFWKsFhr8J9tyYk5pkoydRr5_d6I",
            }}
            style={styles.logo}
          />
          <Text style={styles.logoText}>DonateEasy</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuButton}
        >
          <Icon name="bars" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
        
      {/* Slideshow */}
      <View style={styles.slideContainer}>
        <Image source={slides[slideIndex]} style={styles.slideImage} />
        <View style={styles.overlay} />
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Reduce Food Waste,{"\n"}Feed the Hungry</Text>
          <Text style={styles.heroSubtitle}>
            Join our mission to connect surplus food from donors to those in need.
            {"\n"}“Be the reason someone sleeps with a full stomach today.”
          </Text>
          <TouchableOpacity
            style={styles.donateBtn}
            onPress={() => navigation.navigate("donate")}
          >
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
        <Text style={styles.sectionText}>
          📧 support@donateeasy.com {"\n"}📞 +91 8050259617
        </Text>
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#facc15", // yellow-400
  },
  menuButton: {
    padding: 8,
  },

  container: { flex: 1, backgroundColor: "#111",paddingTop: 40 },
  slideContainer: { height: 500, position: "relative" },
  slideImage: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  heroTextContainer: {
    position: "absolute",
    top: "30%",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroTitle: {
    color: "#FACC15",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    color: "#e5e5e5",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  donateBtn: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  donateText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  section: { padding: 20, backgroundColor: "#1f1f1f", alignItems: "center" },
  sectionDark: { padding: 20, backgroundColor: "#111", alignItems: "center" },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FACC15",
    marginBottom: 12,
  },
  sectionText: {
    color: "#ddd",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },

  counterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  counterBox: { alignItems: "center", margin: 10 },
  counterValue: { fontSize: 28, fontWeight: "800", color: "#FACC15" },
  counterLabel: { color: "#ccc", marginTop: 4, fontSize: 14 },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 12,
  },
  stepCard: {
    width: WIDTH / 1.3,
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 10,
    elevation: 4,
  },
  stepIcon: { width: 80, height: 80, marginBottom: 10 },
  stepTitle: { color: "#FDE047", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  stepDesc: { color: "#ccc", textAlign: "center", fontSize: 14 },

  footer: {
    backgroundColor: "#0a0a0a",
    paddingVertical: 24,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  footerBrand: { color: "#FACC15", fontSize: 22, fontWeight: "700" },
  footerText: { color: "#999", fontSize: 13, marginTop: 6 },
  footerCopy: { color: "#555", fontSize: 12, marginTop: 8 },
});
