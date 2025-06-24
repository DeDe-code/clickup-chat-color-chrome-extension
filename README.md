# ClickUp Message Highlighter Chrome Extension

A Chrome extension built with Vue 3, Vite, and Tailwind CSS to highlight unread messages in ClickUp.

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

# Start development with Chrome extension auto-reload
npm run dev:ext
```

The `dev:ext` command will:

1. Build Tailwind CSS
2. Watch for file changes and rebuild
3. Launch Chrome with the extension loaded
4. Auto-reload the extension when files change

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
- Tailwind CSS for styling
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
