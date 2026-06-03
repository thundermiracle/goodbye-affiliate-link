export default defineBackground(() => {
  // Link resolution now runs inline in the content script (offline-only, pure),
  // so the background no longer resolves links or makes any network request.
  console.log("Goodbye Affiliate Link: Background script loaded!", {
    id: browser.runtime.id,
  });
});
