---
name: VideoAutoStudio
colors:
  surface: '#13131b'
  surface-dim: '#13131b'
  surface-bright: '#393841'
  surface-container-lowest: '#0d0d15'
  surface-container-low: '#1b1b23'
  surface-container: '#1f1f27'
  surface-container-high: '#292932'
  surface-container-highest: '#34343d'
  on-surface: '#e4e1ed'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e4e1ed'
  inverse-on-surface: '#303038'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#13131b'
  on-background: '#e4e1ed'
  surface-variant: '#34343d'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
  h2:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  gutter: 1.5rem
  margin: 2rem
---

## Brand & Style

This design system is built for a high-performance, professional video creation environment. The brand personality is efficient, cinematic, and technologically advanced, aiming to evoke a sense of focused creativity and technical mastery.

The visual style is **Glassmorphism**, leveraging depth through translucency and layered interfaces. This approach mimics the sophisticated overlays found in professional video editing software while maintaining a sleek, modern SaaS aesthetic. Every interaction is designed to feel fluid and responsive, utilizing motion to guide the user through complex creative workflows without visual friction.

## Colors

The color palette is rooted in a deep, nocturnal foundation to minimize eye strain during long editing sessions and to make video content pop. 

- **Primary (Indigo):** Used for primary actions, progress indicators, and active states. It provides a vibrant contrast against the dark background.
- **Backgrounds:** A tiered system using `#0f172a` for the main canvas and `#1e293b` for elevated surfaces like sidebars and card containers.
- **Functional Colors:** Standardized success, warning, and danger colors are utilized for status indicators, rendering alerts, and destructive actions.
- **Interactive States:** Borders and backgrounds should subtly shift toward the primary color or lighten in value upon user interaction.

## Typography

This design system uses a dual-font strategy to balance character with utility. 

**Manrope** is used for headlines to provide a refined, modern, and slightly geometric feel that reflects the "studio" aspect of the platform. All headlines utilize a semi-bold weight to ensure clear hierarchy against dark backgrounds.

**Inter** is the workhorse for body text, controls, and metadata. Its high x-height and neutral tone ensure maximum legibility at small sizes, particularly in the dense UI of a video timeline or property inspector. Secondary text always defaults to a smaller size and the secondary text color for clear information architecture.

## Layout & Spacing

The layout philosophy uses a **fluid grid** model with a consistent 8px (base unit) rhythmic scale. 

- **Grid:** A 12-column system is used for dashboard views, while editor views utilize a "docked" layout with fixed sidebars and a fluid central viewport for the video canvas.
- **Margins & Gutters:** Standard page margins are set to 32px (xl) for breathable layouts, with 24px (lg) gutters between cards.
- **Padding:** Internal card padding should be a minimum of 24px to maintain the professional, spacious feel of the glassmorphic style.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** and light-based hierarchy rather than heavy shadows.

- **Surface Layers:** The base layer is the darkest. Each successive layer (modals, popovers, cards) uses a semi-transparent background with a `backdrop-blur` (minimum 12px).
- **Glass Effect:** Surfaces should have a subtle 1px top-left highlight border (`#ffffff10`) and a bottom-right dark border to simulate physical glass.
- **Shadows:** Standard shadows are avoided in favor of **ambient glows**. On hover, cards should utilize a `shadow-lg` which manifests as a soft, Indigo-tinted diffused glow, accompanied by a `-4px` vertical translation (lift).

## Shapes

The shape language is consistently rounded to soften the technical nature of the video platform.

- **Cards & Containers:** Use `rounded-xl` (1.5rem / 24px) to create a soft, modern frame for content.
- **Buttons & Inputs:** Use `rounded-lg` (1rem / 16px) for a balanced, clickable feel.
- **Badges & Tags:** Use `rounded-full` to distinguish them from interactive buttons.
- **Media Thumbnails:** Use `rounded-lg` to ensure they feel integrated into the UI.

## Components

- **Buttons:** Primary buttons use a solid Indigo background with white text. Secondary buttons use a glass background with a subtle border. All buttons use `transition-all duration-300` for hover and active states.
- **Cards:** The core container. Must feature `backdrop-blur-md`, a semi-transparent background (`#1e293b80`), and a subtle border. Hovering causes a lift effect and the border color to brighten to the primary color.
- **Input Fields:** Dark backgrounds with a 1px border. On focus, the border transitions to Indigo with a subtle outer glow.
- **Timeline & Clips:** Video clips in the timeline should use `rounded-md` with high-contrast labels. Active clips are highlighted with an Indigo stroke.
- **Badges:** Pill-shaped (`rounded-full`), using low-opacity versions of the success, warning, or danger colors for a "ghost" effect.
- **Tooltips:** Small, high-contrast dark surfaces with `rounded-md` and no blur to ensure instant readability.