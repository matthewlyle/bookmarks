const form = document.getElementById("settings-form");
const apiUrlInput = document.getElementById("api-url");
const apiKeyInput = document.getElementById("api-key");
const statusEl = document.getElementById("status");

// Load saved settings on page load
chrome.storage.sync.get(["apiUrl", "apiKey"], (result) => {
  if (result.apiUrl) {
    apiUrlInput.value = result.apiUrl;
  }
  if (result.apiKey) {
    apiKeyInput.value = result.apiKey;
  }
});

// Save settings on form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const apiUrl = apiUrlInput.value.trim().replace(/\/$/, ""); // Remove trailing slash
  const apiKey = apiKeyInput.value.trim();

  if (!apiUrl || !apiKey) {
    showStatus("Please fill in all fields", "error");
    return;
  }

  chrome.storage.sync.set({ apiUrl, apiKey }, () => {
    if (chrome.runtime.lastError) {
      showStatus("Failed to save settings: " + chrome.runtime.lastError.message, "error");
    } else {
      showStatus("Settings saved successfully!", "success");
    }
  });
});

function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status " + type;

  // Auto-hide success messages
  if (type === "success") {
    setTimeout(() => {
      statusEl.className = "status";
    }, 3000);
  }
}
