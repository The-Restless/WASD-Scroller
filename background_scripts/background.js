browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);
  if (message.type === "notification") {
    console.log("Notification message:", message.message);
  }
  // Always return true to indicate async response
  return true;
});

console.log("WASD Scroller background script loaded");
