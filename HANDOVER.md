# Eunie Project Handover Guide

This document provides the necessary context for continuing the development of the **Eunie** project in a new environment (e.g., Stitch or a fresh AI Studio instance).

## 1. Project Identity: "Modern Washi Editorial"
**Eunie** is a high-end digital experience blending traditional Japanese aesthetics ("Ma" - the art of space) with modern editorial layouts.

- **Design Doc**: Refer to `DESIGN.md` for full visual specifications.
- **Key Visuals**: Glassmorphism, Washi textures, oversized radii (`3rem`), and delicate typography.

---

## 2. Technical Stack & Architecture

### 2.1 Core Technologies
- **Frontend**: React 18 + Vite.
- **Styling**: **Tailwind CSS v4** (Note: Configuration is CSS-based in `src/index.css`).
- **Backend**: Firebase (Auth, Firestore, Storage).
- **Animations**: `motion/react` (Framer Motion).
- **Icons**: `lucide-react` (Standardize on `strokeWidth={1}` or `1.5`).

### 2.2 Critical Files to Review
1.  **`src/index.css`**: Contains the Tailwind v4 theme, custom animations (`float`, `glow`), and component classes (`glass-card`, `btn-pill`).
2.  **`firebase-blueprint.json`**: The "Source of Truth" for data structures. **Do not modify Firestore logic without updating this file first.**
3.  **`firestore.rules`**: Defines security boundaries. Follow the "Validator Function Pattern" for all CRUD operations.
4.  **`src/lib/firebase.ts`**: Contains robust initialization and diagnostic tools.
5.  **`vite.config.ts`**: Handles the mapping of environment secrets to the client.

---

## 3. Environment Setup (Secrets)

To ensure Firebase and Gemini work correctly, the following **Secrets** must be configured in the new environment:

| Secret Name | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Google AI SDK Key |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |

> **Note**: These are mapped in `vite.config.ts` using the `define` block to ensure they are accessible via `import.meta.env` in the browser.

---

## 4. Development Guidelines

### 4.1 Firebase Patterns
- **Safety First**: Always wrap Firestore calls with `handleFirestoreError` (see `src/lib/firebase.ts`).
- **Real-time**: Prefer `onSnapshot` for data synchronization.
- **Auth Readiness**: Ensure `isAuthReady` is true before attaching listeners.

### 4.2 Styling Constraints
- **Spacing**: Respect the "Ma" principle. Don't crowd elements.
- **Typography**: Use `Playfair Display` for H1/H2 and `Noto Sans JP` for body text.
- **Interactive**: Hover states should feel like "Ink Bleeding" (soft transitions).

---

## 5. Handover Prompt for the Next AI

Copy and paste the following prompt to the new AI assistant:

> "I am handing over the **Eunie** project. It is a **Modern Washi Editorial** experience. 
> 
> Please perform the following steps:
> 1. Read `DESIGN.md` to understand the visual language.
> 2. Read `firebase-blueprint.json` to understand the data architecture.
> 3. Check `src/index.css` for the Tailwind v4 theme and custom animations.
> 4. Ensure all Firebase interactions follow the robust patterns established in `src/lib/firebase.ts`.
> 
> **Current Goal**: [Insert your current task here, e.g., 'Implement the user profile page' or 'Debug the post creation flow']."
