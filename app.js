let scrollStep = 150; // Default scroll speed

// Load scroll speed from storage and update immediately
browser.storage.local.get("scrollStep").then((data) => {
  if (data.scrollStep !== undefined) {
    scrollStep = data.scrollStep;
    console.log(`Scroll speed loaded: ${scrollStep}`);
  }
});

// Listen for updates from the background script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === "updateSpeed") {
    scrollStep = message.scrollStep;
    console.log(`Scroll speed updated to ${scrollStep}`);
    showCustomNotification(`Scroll speed updated to ${scrollStep}`);
  }
});

// Function to save scroll speed
function saveScrollSpeed() {
  browser.storage.local.set({ scrollStep });
  // Notify the background script to broadcast the update
  browser.runtime.sendMessage({ type: "updateSpeed", scrollStep });
}

// Function to create and show a custom notification
function showCustomNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 9999;
    transition: opacity 0.5s;
  `;
  document.body.appendChild(notification);
  // Fade out and remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Function to handle speed changes
function speedHandle(increase) {
  scrollStep = Math.max(scrollStep + (increase ? 5 : -5), 0);
  saveScrollSpeed(); // Save and broadcast the new speed
  const message = `Scroll speed ${
    increase ? "increased" : "decreased"
  } to ${scrollStep}`;
  showCustomNotification(message);
}

// Function to scroll the page
function scrollPage(x, y) {
  // Try scrolling the document's scrolling element
  const scrollTarget =
    document.scrollingElement || document.documentElement || document.body;

  // Check if the target can scroll vertically or horizontally
  if (x !== 0 && scrollTarget.scrollWidth > scrollTarget.clientWidth) {
    scrollTarget.scrollBy({ left: x, behavior: "smooth" });
  }
  if (y !== 0 && scrollTarget.scrollHeight > scrollTarget.clientHeight) {
    scrollTarget.scrollBy({ top: y, behavior: "smooth" });
  }

  // Attempt to scroll additional containers (e.g., Twitch's chat window)
  document.querySelectorAll("*").forEach((el) => {
    if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
      el.scrollBy({ left: x, top: y, behavior: "smooth" });
    }
  });
}

// Function to check if the element is editable
function isEditable(element) {
  // Check if the element is in a shadow DOM
  while (element && element.shadowRoot) {
    element = element.shadowRoot.activeElement;
  }

  // Check if the element is content-editable or a form input
  return (
    element &&
    (element.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) ||
      element.closest("fieldset") !== null)
  );
}

// Event listener for keydown
document.addEventListener(
  "keydown",
  (event) => {
    const activeElement = document.activeElement;

    // Skip if the target is an editable element
    if (isEditable(activeElement)) {
      return;
    }

    // Handle scroll keys
    let handled = false;
    switch (event.key.toLowerCase()) {
      case "w":
        scrollPage(0, -scrollStep);
        handled = true;
        break;
      case "s":
        scrollPage(0, scrollStep);
        handled = true;
        break;
      case "a":
        scrollPage(-scrollStep, 0);
        handled = true;
        break;
      case "d":
        scrollPage(scrollStep, 0);
        handled = true;
        break;
      case "q":
        speedHandle(false);
        handled = true;
        break;
      case "e":
        speedHandle(true);
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault(); // Prevent default behavior
      event.stopImmediatePropagation(); // Stop further propagation
    }
  },
  { capture: true } // Capture phase ensures your handler runs first
);

// Log script loaded
console.log("WASD Scroller content script loaded");
