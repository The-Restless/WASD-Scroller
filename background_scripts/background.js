// Listener for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);

  if (message.type === "notification") {
    console.log("Notification message:", message.message);
  }

  if (message.type === "updateSpeed") {
    console.log(`Broadcasting scroll speed update: ${message.scrollStep}`);

    // Broadcast the new scroll speed to all other tabs
    browser.tabs.query({}).then((tabs) => {
      tabs.forEach((tab) => {
        if (tab.id !== sender.tab.id) {
          browser.tabs
            .sendMessage(tab.id, {
              type: "updateSpeed",
              scrollStep: message.scrollStep,
            })
            .catch((err) =>
              console.warn(`Could not send message to tab ${tab.id}:`, err)
            );
        }
      });
    });
  }

  // Always return true to indicate async response
  return true;
});
