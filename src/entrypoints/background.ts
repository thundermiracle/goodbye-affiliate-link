import { isAffiliateCookieDomain } from "@/core/affiliateCookieDomains";
import { createCookieCleaner } from "@/services/cookieCleaner";
import { SETTINGS_KEYS, loadSettings } from "@/services/settings";

export default defineBackground(() => {
  console.log("Goodbye Affiliate Link: Background script loaded!", {
    id: browser.runtime.id,
  });

  const cleaner = createCookieCleaner(chrome.cookies);

  // Registered synchronously at the top level so the (ephemeral MV3) service
  // worker reliably wakes on cookie changes. The cheap domain check runs first
  // so we only load settings for affiliate-network cookies, not every cookie.
  chrome.cookies.onChanged.addListener(async (change) => {
    if (change.removed || !isAffiliateCookieDomain(change.cookie.domain)) return;
    const { enabled } = await loadSettings();
    if (enabled !== false) cleaner.handleChange(change);
  });

  // Sweep any pre-existing affiliate cookies on startup and whenever enabled.
  loadSettings().then(({ enabled }) => {
    if (enabled !== false) cleaner.clearAll();
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[SETTINGS_KEYS.ENABLED]?.newValue === true) {
      cleaner.clearAll();
    }
  });
});
