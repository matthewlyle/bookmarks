# Bookmarks Chrome Extension

A simple Chrome extension to quickly save bookmarks to your personal collection.

## Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension icon should appear in your toolbar

## Usage

1. Navigate to any webpage you want to bookmark
2. Click the extension icon in your toolbar
3. The badge will show:
   - `...` while saving
   - `✓` on success (green, clears after 2 seconds)
   - `✗` on error (red, clears after 3 seconds)

## Configuration

The extension uses `http://localhost:3000` as the default backend URL.

To use with your deployed site:

1. Open `background.js`
2. Change `API_BASE_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)
3. Reload the extension in `chrome://extensions/`

## Icons

The extension requires icon files (`icon16.png`, `icon48.png`, `icon128.png`).

Create icons using any image editor or online tool like [favicon.io](https://favicon.io/favicon-generator/). Save them as PNG files with the required sizes (16x16, 48x48, 128x128) in the `extension` folder.
