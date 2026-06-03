import logo from "@/assets/goodbye-affiliate-link.png";
import "./App.css";
import { SETTINGS_KEYS, SettingsType } from "@/services/settings";
import { useState, useEffect } from "react";
import { loadSettings, saveSetting } from "@/services/settings";

function App() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleToggleChange = async (key: string, checked: boolean) => {
    if (!settings) return;

    try {
      await saveSetting(key, checked);
      setSettings({
        ...settings,
        [key]: checked,
      });

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error(`Failed to save setting for ${key}:`, error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <img src={logo} className="logo" alt="goodbye affiliate link logo" />
      </div>
      <div className="card">
        {settings && (
          <div className="settings-container">
            <ToggleSwitch
              id="enabled"
              label="有効"
              defaultChecked={settings.enabled}
              onChange={(checked) => handleToggleChange(SETTINGS_KEYS.ENABLED, checked)}
            />
            <ToggleSwitch
              id="resolveOpaque"
              label="不透明リンクもクリック時に解決（通信あり）"
              defaultChecked={settings.resolveOpaque}
              onChange={(checked) => handleToggleChange(SETTINGS_KEYS.RESOLVE_OPAQUE, checked)}
            />
          </div>
        )}

        <p>ページ中のアフィリエイトリンクを元々のURLに戻すChrome拡張機能です。</p>
      </div>
    </>
  );
}

export default App;
