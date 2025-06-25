// Test script to validate Feature Flag toggle functionality
// This can be run in the browser console to test the phone dialer toggle

console.log("🧪 Testing Feature Flag Toggle Functionality");

// Function to check current state
function checkPhoneFeatureState() {
  const phoneButton = document.querySelector(
    'button [data-lucide="phone"]'
  )?.parentElement;
  const isVisible =
    phoneButton && window.getComputedStyle(phoneButton).display !== "none";

  console.log("📱 Phone button visible:", isVisible);
  return isVisible;
}

// Function to find and click toggle button in admin
function findToggleButton() {
  // Look for toggle buttons in feature flag manager
  const toggleButtons = Array.from(document.querySelectorAll("button")).filter(
    (btn) =>
      btn.textContent?.includes("Toggle") ||
      btn.querySelector('[data-lucide="toggle"]') ||
      btn.className.includes("toggle")
  );

  console.log("🔄 Found toggle buttons:", toggleButtons.length);
  return toggleButtons;
}

// Test sequence
async function runFeatureFlagTest() {
  console.log("📊 Initial state check:");
  const initialState = checkPhoneFeatureState();

  console.log("🔍 Looking for admin dashboard...");

  // Check if we're on admin page
  const currentUrl = window.location.href;
  if (!currentUrl.includes("/admin")) {
    console.log("❌ Not on admin page. Please navigate to /admin first");
    return;
  }

  console.log("✅ On admin page, looking for feature flag controls...");

  // Wait a moment for React to render
  setTimeout(() => {
    const toggleButtons = findToggleButton();

    if (toggleButtons.length > 0) {
      console.log("✅ Feature flag test environment ready!");
      console.log("📝 Instructions:");
      console.log(
        "1. Look for the PHONE_DIALER feature flag in the admin dashboard"
      );
      console.log("2. Click the toggle button to change the enabled state");
      console.log(
        "3. Check if the phone button appears/disappears in the header"
      );
      console.log("4. Run checkPhoneFeatureState() to verify the change");
    } else {
      console.log(
        "❌ No toggle buttons found. Make sure you're in the Feature Flags section"
      );
    }
  }, 1000);
}

// Export functions for manual testing
window.testFeatureFlags = {
  checkPhoneFeatureState,
  findToggleButton,
  runFeatureFlagTest
};

console.log("🚀 Feature flag test utilities loaded!");
console.log(
  "💡 Run window.testFeatureFlags.runFeatureFlagTest() to start testing"
);
