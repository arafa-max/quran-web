export interface AppSettings {
  theme: "dark" | "light";
  fontSize: "sm" | "md" | "lg" | "xl";
  interfaceLang: "ru" | "en" | "du";
  compactMode: boolean;
  soundEnabled: boolean;
  fontSmoothing: boolean;
}

export const defaultSettings: AppSettings = {
  theme: "dark",
  fontSize: "md",
  interfaceLang: "ru",
  compactMode: false,
  soundEnabled: true,
  fontSmoothing: true,
};

const KEY = "quran_settings";

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
