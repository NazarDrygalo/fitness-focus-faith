import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.8096d6cb25784ae7b2d308b74e526b80",
  appName: "grindfaith",
  webDir: "dist",
  server: {
    url: "https://8096d6cb-2578-4ae7-b2d3-08b74e526b80.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    Keyboard: { resize: "body" },
  },
};

export default config;
