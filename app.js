let scrollStep = 50; // Amount to scroll per keypress

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
  const message = `Scroll speed ${
    increase ? "increased" : "decreased"
  } to ${scrollStep}`;
  showCustomNotification(message);
  browser.runtime.sendMessage({ type: "notification", message: message });
}

// Function to scroll the page
function scrollPage(x, y) {
  window.scrollBy({
    top: y,
    left: x,
    behavior: "smooth",
  });
}

// Function to check if the element is editable
function isEditable(element) {
  return (
    element.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) ||
    element.closest("fieldset") !== null
  );
}

document.addEventListener("keydown", (event) => {
  if (isEditable(event.target)) {
    return; // Don't interfere with editable elements
  }

  switch (event.key.toLowerCase()) {
    case "w":
      scrollPage(0, -scrollStep);
      event.preventDefault();
      break;
    case "s":
      scrollPage(0, scrollStep);
      event.preventDefault();
      break;
    case "a":
      scrollPage(-scrollStep, 0);
      event.preventDefault();
      break;
    case "d":
      scrollPage(scrollStep, 0);
      event.preventDefault();
      break;
    case "q":
      speedHandle(false);
      event.preventDefault();
      break;
    case "e":
      speedHandle(true);
      event.preventDefault();
      break;
  }
});

console.log("WASD Scroller content script loaded");
