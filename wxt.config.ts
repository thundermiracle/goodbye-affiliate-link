import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  outDir: "dist",
  manifest: {
    name: "Goodbye Affiliate Link",
    description:
      "ページ中のアフィリエイトリンクを元々のURLに戻すChrome拡張機能です。",
    version: "1.0.0",
    permissions: ["storage"],
    host_permissions: ["*://*/*"],
    browser_specific_settings: {
      gecko: {
        id: "goodbye-affiliate-link@thundermiracle.com",
      }
    }
  },
  webExt: {
    binaries: {
      // use brave browser
      chrome: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    },
  },
});
