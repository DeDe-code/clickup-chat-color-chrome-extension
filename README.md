# ClickUp Message Highlighter Chrome Extension

A Chrome extension built with Vue 3 and Vite to highlight unread messages in ClickUp.

## Features

- Highlights unread messages in ClickUp
- Customizable text and background colors
- Light/dark/system theme support
- Color picker for easy customization

## Development Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Chrome browser

### Installation

```bash
# Install dependencies
npm install
```

### Development Workflow

```bash
# Start development server with hot reload
npm run dev

# Build and watch for changes (without opening browser)
npm run dev:ext

# Start development with Chrome extension auto-reload in browser
npm run dev:ext:browser

# Alternative development command (if content.js loading fails)
npm run dev:ext:simple

# Alternative development command with browser (if content.js loading fails)
npm run dev:ext:simple:browser

# Clean build directories and rebuild everything
npm run dev:clean
```

The `dev:ext` command will:

1. Clean the dist directory
2. Build the extension
3. Watch for file changes and rebuild

The `dev:ext:browser` command will do all of the above plus: 4. Launch Chrome with the extension loaded 5. Auto-reload the extension when files change

### Troubleshooting

If you encounter a "Could not load javascript 'content.js' for script" error:

1. Try using `npm run dev:ext:simple` (or `npm run dev:ext:simple:browser` if you want to open Chrome) instead, which uses a simpler build process
2. Run `npm run dev:clean` to clean all build directories and rebuild
3. Check Chrome extension management page for additional errors
4. Verify the content script is being built correctly with `npm run check:content`

### Building for Production

```bash
# Build for production
npm run build

# Build extension package for distribution
npm run build:ext
```

The production build will be in the `dist` folder. The packaged extension will be in `web-ext-artifacts`.

## Architecture

- Vue 3 with Composition API
- Vite for fast development and optimized builds
- Custom CSS for styling
- Pinia for state management
- Chrome Storage API for persistence

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
