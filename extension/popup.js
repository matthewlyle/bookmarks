// DOM elements
const loadingEl = document.getElementById("loading");
const configErrorEl = document.getElementById("config-error");
const mainEl = document.getElementById("main");
const faviconContainer = document.getElementById("favicon-container");
const pageTitleEl = document.getElementById("page-title");
const categorySelect = document.getElementById("category");
const saveBtn = document.getElementById("save-btn");
const btnText = document.getElementById("btn-text");
const errorEl = document.getElementById("error");
const openOptionsBtn = document.getElementById("open-options");

// State
let currentTab = null;
let settings = null;

// Initialize popup
async function init() {
  try {
    // Get settings
    settings = await getSettings();
    
    if (!settings.apiUrl || !settings.apiKey) {
      showConfigError();
      return;
    }

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    // Show main UI
    loadingEl.style.display = "none";
    mainEl.style.display = "block";

    // Display tab info
    displayTabInfo(tab);

    // Fetch categories
    await fetchCategories();
  } catch (error) {
    console.error("Init error:", error);
    showError("Failed to initialize: " + error.message);
  }
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["apiUrl", "apiKey"], (result) => {
      resolve(result);
    });
  });
}

function showConfigError() {
  loadingEl.style.display = "none";
  configErrorEl.style.display = "block";
}

function displayTabInfo(tab) {
  // Set title
  pageTitleEl.textContent = tab.title || tab.url;

  // Set favicon
  if (tab.favIconUrl) {
    const img = document.createElement("img");
    img.className = "favicon";
    img.src = tab.favIconUrl;
    img.alt = "";
    img.onerror = () => {
      // Keep placeholder on error
    };
    faviconContainer.innerHTML = "";
    faviconContainer.appendChild(img);
  }
}

async function fetchCategories() {
  try {
    const response = await fetch(`${settings.apiUrl}/api/categories`, {
      headers: {
        "x-api-key": settings.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const { data: categories } = await response.json();

    // Populate select
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Non-fatal - categories are optional
  }
}

async function saveBookmark() {
  if (!currentTab) return;

  // Disable button and show loading
  saveBtn.disabled = true;
  btnText.innerHTML = '<span class="btn-loading"><span class="spinner"></span>Saving...</span>';
  hideError();

  try {
    const categoryId = categorySelect.value || undefined;

    const response = await fetch(`${settings.apiUrl}/api/bookmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": settings.apiKey,
      },
      body: JSON.stringify({
        url: currentTab.url,
        title: currentTab.title,
        categoryId,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Failed to save bookmark");
    }

    // Close popup on success
    window.close();
  } catch (error) {
    console.error("Save error:", error);
    showError(error.message);

    // Reset button
    saveBtn.disabled = false;
    btnText.textContent = "Save Bookmark";
  }
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function hideError() {
  errorEl.style.display = "none";
}

// Event listeners
saveBtn.addEventListener("click", saveBookmark);

openOptionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// Initialize
init();
