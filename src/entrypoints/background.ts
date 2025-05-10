export default defineBackground(() => {
  console.log("Goodbye Affiliate Link: Background script loaded!", {
    id: browser.runtime.id,
  });
});
