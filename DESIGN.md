# Eunie Design System: Modern Washi Editorial

## 1. Design Philosophy: "Ma" (間)
**Eunie** is built on the principle of **"Ma"** — the artistic use of space and silence. The design aims to create a serene, organic, and culturally rich digital environment by blending traditional Japanese aesthetics with modern editorial layouts.

- **Organic Texture**: Utilizing Washi-paper backgrounds and soft, oversized radii.
- **Depth & Clarity**: Employing Glassmorphism and blurred shadows to create a sense of floating layers.
- **Rhythmic Contrast**: Bold typographic hierarchy with generous letter-spacing.

---

## 2. Color Palette

### 2.1 Base Tones (Light Mode)
- **Washi Background (`bg-washi`)**: `#FDFCF8` - A warm, textured off-white.
- **Ink (`ink`)**: `#2E2E2E` - Deep charcoal, softer than pure black.
- **Ink Muted (`ink-muted`)**: `#8E8E8E` - Faded ink for secondary information.

### 2.2 Urushi Tones (Dark Mode - Conceptual)
- **Urushi Black**: `#0D0D0D` - Deep lacquer black.
- **Gold Leaf**: `#D4AF37` - Accents for high-contrast elements.
- **Vermilion**: `#7E1E1E` - Deep, muted red for highlights.

### 2.3 Five Elements (Spring Palette)
Vibrant traditional Japanese colors used for functional accents:
- **Wood (萌黃 Moegi)**: `#A8C97F` - Growth, vitality, primary actions.
- **Fire (躑躅 Tsutsuji)**: `#E95464` - Alerts, passion, highlights.
- **Earth (山吹 Yamabuki)**: `#FFB11B` - Warmth, warnings, secondary actions.
- **Metal (白磁 Hakuji)**: `#F8FBF8` - Purity, card backgrounds.
- **Water (淺蔥 Asagi)**: `#33A6B8` - Flow, calm, interactive states.

---

## 3. Typography

### 3.1 Font Families
- **Display/Serif**: `Playfair Display` + `Noto Serif TC/JP`.
- **Body/Sans**: `Inter` + `Noto Sans JP`.
- **Accent/Calligraphy**: `Shippori Mincho`.

### 3.2 Typographic Hierarchy
- **H1 (The Statement)**: `extralight`, `tracking-tighter-massive`, `leading-[1.05]`.
- **H2 (The Rhythm)**: `light`, `tracking-[0.2em]`, `uppercase`.
- **Body**: `light`, `opacity-90`, `leading-relaxed`.
- **Vertical Text**: Used for decorative side-labels or poetic asides.

---

## 4. UI Components & Layout

### 4.1 Glassmorphism (`glass-card`)
- **Surface**: `white/30` with `backdrop-blur-xl`.
- **Border**: `white/40` subtle stroke.
- **Radius**: `3rem` (48px) for a soft, pebble-like feel.

### 4.2 Buttons (`btn-pill`)
- **Shape**: Full pill (rounded-full).
- **Style**: Thin borders, high letter-spacing (`0.2em`), ultra-light font weight.
- **Interaction**: Inversion on hover (Ink background, White text).

### 4.3 Layout Grid
- **Ma Container**: Max-width `1200px` with responsive padding (`1.5rem` to `2rem`).
- **Editorial Grid**: 12-column system with wide gutters (`2rem`).

---

## 5. Motion & Interaction: "Ink & Water"

### 5.1 Animations
- **Float**: Subtle Y-axis movement for floating elements.
- **Fade-Up**: Entrance animation with a blur-to-clear transition, mimicking mist clearing.
- **Glow**: Slow, rhythmic background light changes.

### 5.2 Interaction Details
- **Iconography**: Use `lucide-react` with `strokeWidth={1}` or `1.5` for a delicate, hand-drawn feel.
- **Ink Bleed**: Hover states should feel like ink spreading on paper (soft transitions, slight expansions).
- **Water Ripple**: Click interactions should evoke a gentle ripple in a pond.

---

## 6. Implementation Notes
- **Tailwind CSS**: Use utility classes for all styling.
- **Motion**: Use `framer-motion` for complex transitions.
- **Accessibility**: Ensure high contrast for text on Washi backgrounds.
