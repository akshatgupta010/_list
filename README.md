# HORIZON // Personal Bucket List Web App

> **A quiet, high-end sci-fi interface for your life's greatest aspirations.**
> Client-only single-page application · LocalStorage persistence with corruption recovery · Chrome Glitch visual theme

---

## 🌌 Overview

HORIZON is a personal bucket list web application built with **React 19**, **TypeScript**, and **Tailwind CSS**. Users capture dreams, plan subtasks and budgets, categorize life priorities, track achievement velocity, and reflect on completed memories. 

All user data lives **strictly inside the browser's localStorage** — no cloud databases, no account signups, zero tracking, and zero third-party network requests.

---

## 🎨 Visual System: "Chrome Glitch"

Inspired by futuristic chrome, liquid-metal, and crystal aesthetics:
- **Pearl & Obsidian Themes**: Near-monochrome palette (`pearl-50` to `pearl-200` light theme; `obsidian-950` to `obsidian-800` dark theme) meeting strict **WCAG AA 4.5:1** contrast.
- **Chrome Gradients**: Dynamic multi-stop metallic fills for progress bars, primary buttons, and badges.
- **Cybernetic Registration Hairlines**: Corner brackets `[ + ]`, registration marks, and 1px dividers.
- **Glitch & Ripple Accents**: Subtle 260ms non-looping slice-offset hover effect on major headings and 404 page.
- **Motion Safety**: Full compliance with `prefers-reduced-motion` disabling all slices, confetti, and transitions.

---

## ⚡ Tech Stack & Architecture

- **UI Framework**: React 19 + TypeScript (strict mode enabled)
- **Bundler & Tooling**: Vite 6 + Tailwind CSS v3.4 + PostCSS
- **Routing**: `react-router-dom` using `createHashRouter` for zero-configuration static hosting (GitHub Pages, Vercel, Netlify)
- **Form Management & Validation**: React Hook Form + Zod (single source of truth for schemas and env)
- **State & Storage Engine**: Zustand store backed by a resilient, debounced persistence engine (`src/lib/storage.ts`) with automatic corruption recovery, quota safeguards, and cross-tab sync via the `storage` event
- **Analytics & Data Visualizations**: Recharts (code-split and lazy-loaded on `/stats`)
- **Celebration Effects**: `canvas-confetti` (disabled under reduced motion)
- **Testing**: Vitest + React Testing Library + jsdom

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Active LTS v20+ or v22+, verified on Node v24)
- npm v10+

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:5173/#/` in your browser.

### Run Unit Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```
Generates optimized static assets in `dist/`.

---

## 🛡️ Data Safety & Storage Specification

| Feature | Behavior |
|---|---|
| **Atomic Writes** | All app state is saved as a single JSON object under key `horizon:v1`, debounced (300ms) and flushed immediately on `visibilitychange` or `pagehide`. |
| **Corruption Recovery** | If unreadable or corrupted JSON is detected, the raw data is safely preserved in `horizon:v1:corrupt-<timestamp>`, clean defaults are loaded, and a banner offers immediate download of the corrupt string. |
| **Storage Quota Safeguard** | Catches `QuotaExceededError`, keeps state in memory, and triggers an export recommendation. |
| **Memory-Only Fallback** | In private browsing or storage-blocked environments, runs gracefully in memory with a persistent warning banner. |
| **Cross-Tab Sync** | Listens to the `storage` event to reload state instantly when updated from another tab. |
| **Export & Import** | Full JSON export (`horizon-backup-YYYY-MM-DD.json`). Import validates against Zod schemas, limits file size (<5MB), and offers **Replace** or **Merge** (conflict resolution by newer `updatedAt`). |
| **Reset with Confirmation** | Full wipe requires typing `"DELETE"` in the confirmation dialog. |

---

## 🔒 Security & Privacy Standard

- **No Remote Transmission**: Goals, reflections, notes, and budgets never leave the local device.
- **XSS Prevention**: All user text is rendered as React text nodes. Zero usage of `dangerouslySetInnerHTML` or `innerHTML`.
- **Zero Secrets**: No sensitive keys in source or client environment variables.
- **Recommended Content Security Policy (CSP)** for static hosts:
  ```http
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; object-src 'none'; frame-ancestors 'none';
  ```

---

*HORIZON 1.0. Quiet interface, loud dreams, your data on your device.*
