import { Platform } from "react-native";

// For Android Emulator, use 10.0.2.2 to access host localhost
// For iOS Simulator, localhost works fine
// For physical devices, you MUST replace this with your computer's LAN IP (e.g., http://192.168.1.5:4000)
const DEV_API_URL = Platform.select({
    android: "http://10.0.2.2:4000",
    ios: "http://localhost:4000",
    default: "http://localhost:4000",
});

export const API_URL = DEV_API_URL;
