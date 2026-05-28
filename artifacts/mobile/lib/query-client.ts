import { Platform } from "react-native";
import { setBaseUrl } from "@workspace/api-client-react";

let baseUrl = "";

export function initBaseUrl() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    baseUrl = `https://${domain}`;
    setBaseUrl(baseUrl);
  }
}

export function getApiUrl(): string {
  // On web, derive the API domain from window.location
  // Expo web runs at *.expo.sisko.replit.dev
  // The API proxy runs at *.sisko.replit.dev (same prefix, no .expo.)
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const apiHostname = hostname.includes(".expo.")
      ? hostname.replace(".expo.", ".")
      : hostname;
    return `https://${apiHostname}/`;
  }
  return baseUrl ? `${baseUrl}/` : "/";
}
