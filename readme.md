# Smart Browser Home

A space-themed, customizable start page Progressive Web App designed to replace the default new-tab experience. It combines a multi-engine search bar, shortcut grids for tools and AI services, and local persistence so your layout stays intact.

## Features

- Cosmic-themed interface with animated space visuals
- Search using Bing, Google, DuckDuckGo, or Brave
- Two customizable shortcut sections: Tools and AI
- Add, edit, delete, and reorder shortcuts in edit mode
- Export/import layout as JSON and reset to defaults
- Progressive Web App support with installability and offline caching

## Project files

- [index.html](index.html) — app layout and UI structure
- [style.css](style.css) — visual styling, animations, and responsive layout
- [script.js](script.js) — app logic, storage, search, and drag-and-drop behavior
- [manifest.json](manifest.json) — PWA manifest
- [service-worker.js](service-worker.js) — offline caching support
- [test.html](test.html) — simple test/dev page

## Getting started

1. Open [index.html](index.html) in your browser, or serve the folder with a simple static server.
2. Optional local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

3. To install it as a PWA, open the app in a Chromium-based browser and choose Install from the address bar.

## Usage

- Use the search bar to search the web through your selected engine.
- Press `/` to focus search, `Ctrl+N` to add a shortcut, `Ctrl+E` to enter edit mode, and `Ctrl+S` to save your layout.
- In edit mode, drag items to reorder or click the delete button to remove them.

## Customization

- Update the default shortcuts in [script.js](script.js)
- Adjust colors, spacing, and effects in [style.css](style.css)
- Extend supported search engines in [script.js](script.js)
