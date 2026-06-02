import type { CapacitorConfig } from "@capacitor/cli";

// PlantaSpeak AI — native shell config
// The native iOS/Android app loads the live preview URL so all server
// functions (AI gateway, plant analysis, chat) keep working in the app.
const config: CapacitorConfig = {
  appId: "app.lovable.a0641808ad1c4091b3795cd0521409ac",
  appName: "PlantaSpeak AI",
  webDir: "dist",
  server: {
    url: "https://a0641808-ad1c-4091-b379-5cd0521409ac.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
