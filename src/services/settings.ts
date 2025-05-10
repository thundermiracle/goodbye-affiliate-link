// Define keys for the settings
export const SETTINGS_KEYS = {
  ENABLED: 'enabled'
} as const;

// Define the Settings type
export interface Settings {
  [SETTINGS_KEYS.ENABLED]: boolean;
}

// Alternative interface definition to avoid computed property issues
export type SettingsType = {
  enabled: boolean;
};

// Default settings
export const DEFAULT_SETTINGS: SettingsType = {
  enabled: true,
};

// Load settings from chrome.storage.local
export async function loadSettings(): Promise<SettingsType> {
  return new Promise((resolve) => {
    chrome.storage.local.get(Object.values(SETTINGS_KEYS), (result) => {
      const settings: SettingsType = { ...DEFAULT_SETTINGS };
      
      // Only override default values if they exist in storage
      if (result[SETTINGS_KEYS.ENABLED] !== undefined) {
        settings.enabled = result[SETTINGS_KEYS.ENABLED];
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