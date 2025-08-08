# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brower is a Vue.js web application that helps users easily install multiple macOS applications using Homebrew. Users can select apps from a curated list and generate a single Homebrew installation command.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start production server (after build)
npm run start

# Update app database from Google Sheet
npm run update-db

# Type checking
vue-tsc --noEmit

# Linting (no dedicated script - add if needed)
```

## Architecture

### Tech Stack
- **Frontend**: Vue 3 with Composition API and TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with scoped styles in Vue components
- **Internationalization**: vue-i18n for multi-language support (EN/FR)
- **Production Server**: Express.js (server.cjs)

### Key Components

1. **Data Flow**
   - `src/services/dataService.ts`: Manages app data fetching from Google Sheets CSV or fallback to local db.json
   - `src/store.ts`: Reactive store for managing selected apps state
   - Data priority: localStorage cache → Google Sheet → db.json fallback

2. **Core Files**
   - `src/App.vue`: Main application component with language switcher and modal trigger
   - `src/components/List.vue`: Displays categorized app list with checkboxes
   - `src/components/Modal.vue`: Shows generated Homebrew installation command
   - `src/i18n.ts`: Internationalization configuration for EN/FR languages

3. **Data Structure**
   - Apps have: name, code, brew command, optional tap, logo, category, URL, descriptions (EN/FR), special flag
   - Categories are dynamically extracted from app data
   - Selected apps tracked in reactive store with count

### Data Management Strategy

The app uses a sophisticated caching and fallback system:
1. First checks localStorage for cached data
2. Validates cache freshness against Google Sheet's Last-Modified header
3. Falls back to bundled db.json if Google Sheet unavailable
4. Background refresh in development mode only
5. Production uses pre-bundled data to avoid runtime fetching issues

### Important Patterns

- **Environment Variables**: Uses `import.meta.env.VITE_GOOGLE_SHEET_URL` for Google Sheet URL
- **Reactive State**: Uses Vue's reactive store pattern for app selection state
- **Component Communication**: Props down, events up pattern with store for global state
- **Error Handling**: Graceful fallbacks at each data fetching level
- **Build Optimization**: db.json bundled at build time for production reliability

## Deployment Notes

- Production build outputs to `dist/` directory
- Express server serves static files from `dist/`
- Environment variable `PORT` configurable (default: 3000)
- Postinstall hook automatically builds on deployment