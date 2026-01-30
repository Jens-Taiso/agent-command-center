# CLAUDE.md — Agent Command Center

## Project Overview

AgentOS Agent Command Center — a React dashboard for managing AI agents and human-in-the-loop workflows. Features include agent monitoring, project management with a 7-step wizard, workflow builder, analytics, team management, and tool integrations.

## Tech Stack

- **React 18** (Create React App)
- **Tailwind CSS 3.4** with PostCSS + Autoprefixer
- **No routing library** — custom view-based routing via `currentView` state
- **No state management library** — all state via React `useState` hooks
- **No component library** — custom components throughout

## Commands

```bash
npm start        # Dev server
npm run build    # Production build
npm test         # Run tests (Jest via react-scripts)
```

## Architecture

**Monolithic component structure** — the entire UI lives in a single file:

- `src/components/AgentCommandCenter.jsx` (~5,600 lines) — all views, subcomponents, and sample data
- `src/index.js` — React entry point
- `src/index.css` — Tailwind directives + CSS custom properties (design tokens)

Views are rendered via a `switch` on `currentView` state: `command-center`, `project-dashboard`, `project-wizard`, `analytics-performance`, `inbox`, `team`, `schedule`, `activity`, `tools`, `settings`.

## Design System

**Colors** (defined as CSS custom properties in `index.css` and `tailwind.config.js`):
- Primary: Sage (`#6b9b37`), Teal (`#008b8b`)
- Neutral: Cream (`#f5f2eb`), Charcoal (`#333333`)
- Semantic: Amber (warning), Red/Rust (error), Green (success), Purple (handoff)

**Typography**: Inter font family, weights 400–700

**Shadows**: Custom soft shadows (`shadow-soft`, `shadow-soft-md`, `shadow-soft-lg`)

**Cards**: `rounded-lg` with soft shadows, cream/white backgrounds

See `design-system.md` for full documentation.

## Code Conventions

- **PascalCase** for React components (`CommandCenterView`, `StatusBadge`)
- **camelCase** for functions and variables (`handleSearch`, `currentView`)
- **Arrow functions** for all component definitions
- **Tailwind utility classes** inline — no CSS-in-JS or CSS modules
- **View suffix** for top-level page components (`InboxView`, `ToolsView`)
- Accessibility attributes used throughout: `role`, `aria-label`, `aria-current`, `aria-expanded`

## Key Considerations

- All data is currently hardcoded sample data (no API integration)
- No test files exist yet despite Jest being available
- UX audit exists in `ux-review.md` (score: 6.5/10, 42 issues identified)
- The monolithic file structure is a known limitation
