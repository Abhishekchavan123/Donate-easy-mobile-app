// VolunteerRegisterScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ScrollView,
      StatusBar,
        Platform,
    SafeAreaView,
    ImageBackground,
} from "react-native";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "Every Day",
];

const TIME_SLOTS = [
    "Morning (6 AM - 12 PM)",
    "Afternoon (12 PM - 6 PM)",
    "Evening (6 PM - 10 PM)",
];

export default function VolunteerRegisterScreen({navigation}:any) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [transport, setTransport] = useState("Own Vehicle");
    const [areas, setAreas] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedTimes, setSelectedTimes] = useState([]);

    const toggleDay = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const toggleTime = (time) => {
        setSelectedTimes((prev) =>
            prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
        );
    };

    const validateEmail = (email) =>
        /\S+@\S+\.\S+/.test(email);

    const handleSubmit = () => {
        // Basic validation
        if (!name.trim() || !phone.trim() || !email.trim()) {
            Alert.alert("Missing fields", "Please fill in name, phone and email.");
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert("Invalid email", "Please enter a valid email address.");
            return;
        }

        // Prepare local payload (you can use this object locally or send to parent via props)
        const payload = {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            transport,
            areas: areas.trim(),
            days: selectedDays,
            times: selectedTimes,
            submittedAt: new Date().toISOString(),
        };

        // For frontend-only mode: show success and reset form
        Alert.alert("Success", "✅ Volunteer registration saved locally.");
        console.log("Local volunteer payload:", payload);

        // Reset
        setName("");
        setPhone("");
        setEmail("");
        setTransport("Own Vehicle");
        setAreas("");
        setSelectedDays([]);
        setSelectedTimes([]);
    };

    return (
      
            <ImageBackground
                // replace with your actual image path or remove if you don't want a background image
                source={{
                    uri: "https://qsyyshbhsoqfaxoqdqwp.supabase.co/storage/v1/object/sign/assets/bg4.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NmNiMWMxMC1iZmFiLTQ0NzgtOWY4My00NmIyMDgxZWIyZmMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmc0LmpwZyIsImlhdCI6MTc2NDgyNzAzMiwiZXhwIjoxNzk2MzYzMDMyfQ.V6iG427D0-bRU6g3JKTMXukozNoHvuPyJtDLqCPEfOI",
                }}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                     <StatusBar barStyle="light-content" translucent backgroundColor="#111827" />
                    <View style={styles.navbar}>
                         <TouchableOpacity onPress={() => navigation.navigate('home')}>
                                <Text style={styles.logoText}>DonateEase</Text>
                                </TouchableOpacity>
                        <Text style={styles.navLink}>Join as Volunteer</Text>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.formContainer}>
                            <Text style={styles.title}>Volunteer Registration</Text>

                            <View style={styles.aboutSection}>
                                <Text style={styles.paragraph}>
                                    NGOs rely on volunteers to address social challenges — your time
                                    and energy make a real difference.
                                </Text>
                                <Text style={styles.paragraph}>
                                    Whether distributing supplies, supporting events, or spreading
                                    awareness — every small effort counts.
                                </Text>
                            </View>

                            <View style={styles.grid}>
                                <View style={styles.column}>
                                    <Text style={styles.label}>Full Name</Text>
                                    <TextInput
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Your full name"
                                        placeholderTextColor="#9CA3AF"
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>Phone Number</Text>
                                    <TextInput
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder="Your phone number"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="Your email address"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>Transportation</Text>
                                    <View style={styles.transportContainer}>
                                        {["Own Vehicle", "Public Transport", "Walking"].map(
                                            (item) => (
                                                <TouchableOpacity
                                                    key={item}
                                                    style={[
                                                        styles.transportOption,
                                                        transport === item && styles.transportOptionSelected,
                                                    ]}
                                                    onPress={() => setTransport(item)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.transportText,
                                                            transport === item && styles.transportTextSelected,
                                                        ]}
                                                    >
                                                        {item}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        )}
                                    </View>
                                </View>

                                <View style={styles.column}>
                                    <Text style={styles.label}>Preferred Areas</Text>
                                    <TextInput
                                        value={areas}
                                        onChangeText={setAreas}
                                        placeholder="Areas you can volunteer in"
                                        placeholderTextColor="#9CA3AF"
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>Available Days</Text>
                                    <View style={styles.daysContainer}>
                                        {DAYS.map((day) => (
                                            <TouchableOpacity
                                                key={day}
                                                style={[
                                                    styles.dayChip,
                                                    selectedDays.includes(day) && styles.dayChipSelected,
                                                ]}
                                                onPress={() => toggleDay(day)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dayText,
                                                        selectedDays.includes(day) && styles.dayTextSelected,
                                                    ]}
                                                >
                                                    {day}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.label}>Preferred Time Slots</Text>
                                    <View style={styles.timesContainer}>
                                        {TIME_SLOTS.map((slot) => (
                                            <TouchableOpacity
                                                key={slot}
                                                style={[
                                                    styles.timeChip,
                                                    selectedTimes.includes(slot) && styles.timeChipSelected,
                                                ]}
                                                onPress={() => toggleTime(slot)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.timeText,
                                                        selectedTimes.includes(slot) && styles.timeTextSelected,
                                                    ]}
                                                >
                                                    {slot}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <View style={styles.submitContainer}>
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleSubmit}
                                >
                                    <Text style={styles.submitText}>Submit Registration</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </ImageBackground>
   
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#111827",
    },
    background: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
    },
     navbar: {
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#111827",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
logoText: { fontSize: 28, fontWeight: "700", color: "#facc15" },
  navLink: {
    color: 'white',
    fontSize: 16,
  },


    navLink: {
        fontSize: 16,
        color: "#FBBF24",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 24,
        justifyContent: "center",
    },
    formContainer: {
        backgroundColor: "transparent",
        borderRadius: 20,
        padding: 20,
        shadowColor: "transparent",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
        color: "#F9FAFB",
    },
    aboutSection: {
        marginBottom: 16,
    },
    paragraph: {
        color: "#E5E7EB",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
    },
    column: {
        flex: 1,
        minWidth: "100%",
        paddingVertical: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        marginTop: 8,
        color: "#F9FAFB",
    },
    input: {
        backgroundColor: "#1F2937",
        borderWidth: 1,
        borderColor: "#4B5563",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: "#F9FAFB",
    },
    transportContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    transportOption: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#4B5563",
        marginRight: 8,
        marginTop: 8,
        backgroundColor: "#111827",
    },
    transportOptionSelected: {
        backgroundColor: "#FBBF24",
        borderColor: "#FBBF24",
    },
    transportText: {
        fontSize: 12,
        color: "#E5E7EB",
    },
    transportTextSelected: {
        color: "#111827",
        fontWeight: "600",
    },
    daysContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    dayChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#4B5563",
        marginRight: 8,
        marginTop: 8,
        backgroundColor: "#111827",
    },
    dayChipSelected: {
        backgroundColor: "#F59E0B",
        borderColor: "#F59E0B",
    },
    dayText: {
        fontSize: 12,
        color: "#E5E7EB",
    },
    dayTextSelected: {
        color: "#111827",
        fontWeight: "600",
    },
    timesContainer: {
        marginTop: 4,
    },
    timeChip: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#4B5563",
        marginTop: 8,
        backgroundColor: "#111827",
    },
    timeChipSelected: {
        backgroundColor: "#FBBF24",
        borderColor: "#FBBF24",
    },
    timeText: {
        fontSize: 13,
        color: "#E5E7EB",
    },
    timeTextSelected: {
        color: "#111827",
        fontWeight: "600",
    },
    submitContainer: {
        alignItems: "center",
        marginTop: 16,
    },
    submitButton: {
        backgroundColor: "#FBBF24",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 200,
        alignItems: "center",
    },
    submitText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
});
