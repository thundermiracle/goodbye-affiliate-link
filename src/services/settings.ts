// Define keys for the settings
export const SETTINGS_KEYS = {
  ENABLED: "enabled",
  // Opt-in: also resolve opaque-token affiliate links (whose destination only
  // exists server-side) by contacting the redirect endpoint COOKIELESSLY on
  // hover. Off by default because it makes one network request to the tracker.
  RESOLVE_OPAQUE: "resolveOpaque",
} as const;

// Define the Settings type
export interface Settings {
  [SETTINGS_KEYS.ENABLED]: boolean;
  [SETTINGS_KEYS.RESOLVE_OPAQUE]: boolean;
}

// Alternative interface definition to avoid computed property issues
export type SettingsType = {
  enabled: boolean;
  resolveOpaque: boolean;
};

// Default settings
export const DEFAULT_SETTINGS: SettingsType = {
  enabled: true,
  resolveOpaque: false,
};

// Load settings from chrome.storage.local
export async function loadSettings(): Promise<SettingsType> {
  return new Promise((resolve) => {
    chrome.storage.local.get(Object.values(SETTINGS_KEYS), (result) => {
      const settings: SettingsType = { ...DEFAULT_SETTINGS };

      // Only override default values if they exist in storage
      if (result[SETTINGS_KEYS.ENABLED] !== undefined) {
        settings.enabled = result[SETTINGS_KEYS.ENABLED] === true;
      }
      if (result[SETTINGS_KEYS.RESOLVE_OPAQUE] !== undefined) {
        settings.resolveOpaque = result[SETTINGS_KEYS.RESOLVE_OPAQUE] === true;
      }

      resolve(settings);
    });
  });
}

// Save a setting to chrome.storage.local
export async function saveSetting(key: string, value: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}
