# Design System Strategy: Obsidian Flow

## 1. Overview & Creative North Star
The North Star for this design system is **"The Intelligent Void."** 

Unlike typical gaming platforms that rely on aggressive neon saturation and chaotic grids, this system treats the interface as a sophisticated, living organism. It is an editorial-first experience where AI-driven recommendations are presented with the gravitas of a high-end gallery. We move beyond the "template" look by utilizing intentional asymmetry, expansive negative space, and a depth model that feels liquid rather than rigid. The goal is to make the user feel like they are navigating a high-tech obsidian interface—smooth, deep, and infinitely powerful.

## 2. Color Architecture
The palette is rooted in the depths of midnight, using a hierarchy of dark tones to create a sense of infinite space.

### The Palette
*   **Base Layer:** `surface` (#0b1326) — The foundation of the entire experience.
*   **The Accents:** `primary` (#c0c1ff) and `primary_container` (#8083ff). This Electric Indigo should be used sparingly as a "tactical highlight" to guide the eye toward AI-driven insights.
*   **Tertiary Warmth:** `tertiary` (#ffb783) — Use this for "Critical Hits" or unique game achievements to break the cool-tone monotony.

### The "No-Line" Rule
To maintain the "Obsidian Flow" aesthetic, **1px solid borders are strictly prohibited for sectioning.** Structural boundaries must be defined solely through background color shifts. 
*   Use `surface_container_low` for secondary content areas sitting on the main `surface`.
*   Use `surface_container_high` to pull a featured game card into the foreground.
*   Transitions should feel like different planes of polished stone resting against one another.

### Surface Hierarchy & Nesting
Think of the UI as physical layers. An inner container should always be a "step" away from its parent in the container scale. 
*   *Example:* A list item (`surface_container_highest`) sitting inside a sidebar (`surface_container_low`).

### The "Glass & Gradient" Rule
Standard flat colors lack "soul." 
*   **Interactive Elements:** Use a subtle radial gradient on `primary` buttons, transitioning to `primary_container` at the edges to simulate a soft internal glow.
*   **AI Overlays:** Use `surface_bright` at 60% opacity with a `24px` backdrop blur to create a "Frosted Obsidian" effect for modals and dropdowns.

## 3. Typography
We use a dual-font strategy to balance the "Gamey" energy with "AI Precision."

*   **The Editorial Voice (Manrope):** Used for all `display`, `headline`, and `body` scales. Manrope’s geometric yet warm proportions provide the professional, AI-driven tone. Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) for hero game titles to create a cinematic impact.
*   **The Technical HUD (Space Grotesk):** Reserved for `label-md` and `label-sm`. This mono-spaced influence evokes the feel of a game’s "Heads-Up Display." Use this for meta-data like FPS, player counts, or AI confidence scores.

## 4. Elevation & Depth: Tonal Layering
In this system, light does not come from an external source; it emanates from the interface itself.

*   **The Layering Principle:** Avoid drop shadows for standard cards. Instead, use the spacing scale (`8` or `12`) to create "breathing room" between containers of different surface tiers.
*   **Ambient Shadows:** For "floating" elements like floating action buttons or game trailers, use a diffused shadow: `box-shadow: 0 20px 40px rgba(7, 0, 108, 0.15)`. The shadow color should be a tint of `on_primary_fixed_variant` rather than black.
*   **The "Ghost Border" Fallback:** If high-contrast accessibility is required, use the `outline_variant` at 15% opacity. It should look like a faint reflection on the edge of a glass pane, not a drawn line.

## 5. Components

### Buttons (The "Core Loop")
*   **Primary:** Background of `primary_container` with a subtle inner-glow effect. On hover, the element should emit a `surface_tint` bloom (8px blur).
*   **Secondary:** Glassmorphic base (`surface_container_high` at 40% opacity) with a `ghost border`.
*   **Rounding:** Always use `DEFAULT` (0.5rem) for a modern, balanced feel.

### Selection Chips
*   Used for game genres (RPG, Roguelike).
*   Unselected: `surface_container_lowest`.
*   Selected: `primary_container` with `on_primary_container` text.
*   Shape: Use `full` (9999px) rounding to distinguish them from structural cards.

### Input Fields
*   Never use a white background. Use `surface_container_lowest`.
*   Focus state: The border-less container gains a subtle `primary` glow on the bottom edge (2px thickness).

### Recommendation Cards
*   **No Dividers:** Forbid the use of line dividers. Use `spacing-6` to separate the game title from the description.
*   **Immersive Media:** Game art should use a linear gradient mask that fades into the `surface_container` color at the bottom, making the text feel integrated into the image.

### HUD Data Points (Unique Component)
*   Small, high-density data blocks using `label-sm` (Space Grotesk) and `secondary_fixed_dim` colors. These should feel like "scan data" provided by the AI.

## 6. Do's and Don'ts

### Do
*   **Do** embrace asymmetry. Align large game titles to the left and meta-data to the far right to create an editorial layout.
*   **Do** use `surface_container_highest` for hover states on list items.
*   **Do** use `primary_fixed_dim` for icons to ensure they feel part of the "Indigo" theme.

### Don't
*   **Don't** use pure black (#000000). It kills the depth of the "Obsidian Flow." Stick to the `surface` tokens.
*   **Don't** use standard "Neon" greens or pinks. If you need a secondary accent, use the `tertiary` (#ffb783) muted orange.
*   **Don't** use hard-edged 90-degree corners. This system relies on the `md` (0.75rem) and `DEFAULT` (0.5rem) rounding to feel sleek and approachable.
*   **Don't** overcrowd. If the AI is "intelligent," it knows what *not* to show the user. Use the `spacing-20` and `spacing-24` scales to let hero elements breathe.