# AgentOS Design System

A comprehensive design system documentation for the Agent Command Center React application.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Component Patterns](#component-patterns)
5. [Layout Patterns](#layout-patterns)
6. [Interactive States](#interactive-states)
7. [Icons and Visual Elements](#icons-and-visual-elements)

---

## Color Palette

### Primary Colors

The design system uses Tailwind CSS's slate palette as the primary neutral color, with semantic accent colors for different states and actions.

#### Slate (Primary Neutral)

| Token | Tailwind Class | Hex Value | Usage |
|-------|---------------|-----------|-------|
| Slate 50 | `bg-slate-50` | #f8fafc | Sidebar background, subtle backgrounds |
| Slate 100 | `bg-slate-100` | #f1f5f9 | Input backgrounds, dividers, table backgrounds |
| Slate 200 | `bg-slate-200` | #e2e8f0 | Borders, active sidebar items, hover states |
| Slate 300 | `bg-slate-300` | #cbd5e1 | Scrollbar thumb, disabled states |
| Slate 400 | `bg-slate-400`, `text-slate-400` | #94a3b8 | Muted text, labels, timestamps |
| Slate 500 | `text-slate-500` | #64748b | Secondary text, descriptions |
| Slate 600 | `text-slate-600` | #475569 | Body text, table cell text |
| Slate 700 | `text-slate-700`, `border-slate-700` | #334155 | Dark borders, chart labels |
| Slate 800 | `bg-slate-800` | #1e293b | Search input background (dark) |
| Slate 900 | `bg-slate-900`, `text-slate-900` | #0f172a | Header background, primary buttons, headings |

#### Blue (Primary Action)

| Token | Tailwind Class | Hex Value | Usage |
|-------|---------------|-----------|-------|
| Blue 50 | `bg-blue-50` | #eff6ff | Approval badges, action item backgrounds |
| Blue 100 | `bg-blue-100` | #dbeafe | Active day indicators, icon backgrounds |
| Blue 200 | `border-blue-200` | #bfdbfe | Schedule item borders |
| Blue 400 | `text-blue-400` | #60a5fa | Chart secondary bars |
| Blue 500 | `bg-blue-500` | #3b82f6 | Progress bars, chart primary bars, focus rings |
| Blue 600 | `text-blue-600`, `bg-blue-600` | #2563eb | Links, primary buttons, autonomy indicator |
| Blue 700 | `text-blue-700` | #1d4ed8 | Badge text, hover states |
| Blue 900 | `text-blue-900` | #1e3a8a | Schedule item text |

#### Emerald (Success/Active)

| Token | Tailwind Class | Hex Value | Usage |
|-------|---------------|-----------|-------|
| Emerald 50 | `bg-emerald-50` | #ecfdf5 | Success alert backgrounds |
| Emerald 100 | `bg-emerald-100` | #d1fae5 | Activity icon backgrounds |
| Emerald 200 | `border-emerald-200` | #a7f3d0 | Success alert borders |
| Emerald 400 | `text-emerald-400` | #34d399 | Header metric badges |
| Emerald 500 | `bg-emerald-500` | #10b981 | Active status dots, progress bars |
| Emerald 600 | `text-emerald-600` | #059669 | Autonomous autonomy label, positive metrics |
| Emerald 700 | `text-emerald-700` | #047857 | Connected badge text |
| Emerald 900 | `text-emerald-900` | #064e3b | Alert headings |

#### Amber (Warning/Pending)

| Token | Tailwind Class | Hex Value | Usage |
|-------|---------------|-----------|-------|
| Amber 50 | `bg-amber-50` | #fffbeb | Review badge background |
| Amber 100 | `bg-amber-100` | #fef3c7 | Sidebar badge background |
| Amber 200 | `border-amber-200` | #fde68a | Review badge border |
| Amber 400 | `text-amber-400` | #fbbf24 | Header pending metric |
| Amber 500 | `bg-amber-500` | #f59e0b | Pending status dots, supervised progress |
| Amber 600 | `text-amber-600` | #d97706 | Supervised autonomy label, pending text |
| Amber 700 | `text-amber-700` | #b45309 | Warning badge text |

#### Red (Error/Danger)

| Token | Tailwind Class | Hex Value | Usage |
|-------|---------------|-----------|-------|
| Red 50 | `bg-red-50` | #fef2f2 | Error badge background, reject button bg |
| Red 100 | `bg-red-100` | #fee2e2 | Error icon background |
| Red 200 | `border-red-200` | #fecaca | Error badge border, disconnect button |
| Red 400 | `text-red-400` | #f87171 | Header error metric |
| Red 500 | `bg-red-500` | #ef4444 | Error status dots |
| Red 600 | `text-red-600` | #dc2626 | Error text, reject button text, negative metrics |
| Red 700 | `text-red-700` | #b91c1c | Error badge text |

#### Purple (Handoff/Transfer)

| Token | Tailwind Class | Hex Value | Usage |
|-------|---------------|-----------|-------|
| Purple 50 | `bg-purple-50` | #faf5ff | Handoff badge background |
| Purple 100 | `bg-purple-100` | #f3e8ff | Handoff icon background |
| Purple 200 | `border-purple-200` | #e9d5ff | Handoff badge border |
| Purple 600 | `text-purple-600`, `bg-purple-600` | #9333ea | Handoff text, take over button |
| Purple 700 | `text-purple-700` | #7e22ce | Handoff badge text |

### Semantic Color Usage

```
Status Colors:
- Active: emerald-500 (dot), emerald-600 (text)
- Idle: slate-400 (dot), slate-500 (text)
- Error: red-500 (dot), red-600 (text)
- Pending: amber-500 (dot), amber-600 (text)
- Connected: emerald-500 (dot), emerald-600 (text)
- Disconnected: slate-300 (dot), slate-400 (text)

Autonomy Levels:
- Supervised: amber-600
- Assisted: blue-600
- Autonomous: emerald-600

Action Types:
- Approval: blue-50/blue-700
- Handoff: purple-50/purple-700
- Error: red-50/red-700
- Review: amber-50/amber-700
```

---

## Typography

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

The system uses Inter as the primary font, with system fallbacks for optimal rendering across platforms.

### Font Sizes

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem (12px) | Labels, timestamps, badges, meta text |
| `text-sm` | 0.875rem (14px) | Body text, table cells, descriptions |
| `text-lg` | 1.125rem (18px) | Plus icons, large icons |
| `text-xl` | 1.25rem (20px) | Stat values (medium), section titles |
| `text-2xl` | 1.5rem (24px) | Page headings, tool icons |
| `text-3xl` | 1.875rem (30px) | Large stat numbers |
| `text-4xl` | 2.25rem (36px) | Hero stat numbers |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-medium` | 500 | Active nav items, card titles, emphasis |
| `font-semibold` | 600 | Page headings, stat numbers, section headers |

### Text Styles

```
Section Headers:
- text-xs font-semibold text-slate-400 uppercase tracking-wider

Page Titles:
- text-2xl font-semibold text-slate-900

Card Titles:
- font-medium text-slate-900

Body Text:
- text-sm text-slate-600

Muted/Secondary Text:
- text-xs text-slate-400 or text-xs text-slate-500

Links:
- text-sm text-blue-600 hover:text-blue-700
```

---

## Spacing System

### Standard Spacing Scale

The application uses Tailwind's default spacing scale (0.25rem = 4px base):

| Token | Value | Usage |
|-------|-------|-------|
| `0.5` | 2px | Gap between autonomy bars |
| `1` | 4px | Small gaps, minimal padding |
| `1.5` | 6px | Badge padding, small element spacing |
| `2` | 8px | Icon spacing, button gaps |
| `2.5` | 10px | Sidebar item padding |
| `3` | 12px | Navigation padding, card padding (small) |
| `4` | 16px | Card padding (standard), grid gaps |
| `6` | 24px | Main content padding, large section spacing |
| `8` | 32px | Section bottom margins |

### Common Padding Patterns

```
Cards:
- p-4 (16px all sides) - Standard cards
- p-6 (24px all sides) - Large content areas
- px-4 py-3 (16px horizontal, 12px vertical) - Card headers

Buttons:
- px-2.5 py-1 (10px x 4px) - Small metric pills
- px-2.5 py-1.5 (10px x 6px) - Sidebar items
- px-3 py-1.5 (12px x 6px) - Action buttons
- px-4 py-2 (16px x 8px) - Primary buttons

Badges:
- px-2 py-0.5 (8px x 2px) - Type badges
- px-1.5 py-0.5 (6px x 2px) - Small badges
```

### Common Margin Patterns

```
Section Spacing:
- mb-1 (4px) - Label to content
- mb-2 (8px) - Title to list
- mb-4 (16px) - Section header to content
- mb-6 (24px) - Page title to content
- mb-8 (32px) - Major section spacing

Inline Spacing:
- gap-1 (4px) - Icon to text (tight)
- gap-1.5 (6px) - Autonomy indicator elements
- gap-2 (8px) - Button groups, badge groups
- gap-3 (12px) - Card icon to content
- gap-4 (16px) - Grid items, table cells
- gap-6 (24px) - Large card groups
```

---

## Component Patterns

### Status Badge

A small circular indicator showing status.

```jsx
<span className="inline-block w-2 h-2 rounded-full bg-{color}-500" />
```

Status colors:
- Active: `bg-emerald-500`
- Idle: `bg-slate-400`
- Error: `bg-red-500`
- Pending: `bg-amber-500`
- Connected: `bg-emerald-500`
- Disconnected: `bg-slate-300`

### Type Badge

Labeled badge for categorizing items (approval, handoff, error, review).

```jsx
<span className="px-2 py-0.5 text-xs font-medium rounded border bg-{color}-50 text-{color}-700 border-{color}-200">
  {label}
</span>
```

### Autonomy Indicator

Visual representation of agent autonomy levels (3 bars).

```jsx
<div className="flex items-center gap-1.5 text-xs text-{color}-600">
  <div className="flex gap-0.5">
    {[1,2,3].map(i => (
      <div className={`w-1.5 h-3 rounded-sm ${i <= fill ? 'bg-current' : 'bg-slate-200'}`} />
    ))}
  </div>
  <span>{label}</span>
</div>
```

Levels:
- Supervised: 1 bar filled, `text-amber-600`
- Assisted: 2 bars filled, `text-blue-600`
- Autonomous: 3 bars filled, `text-emerald-600`

### Metric Pill

Header metrics display.

```jsx
<div className="px-2.5 py-1 rounded-md text-xs font-medium bg-{color}-500/20 text-{color}-400">
  <span className="opacity-70">{label}</span>
  <span className="ml-1">{value}</span>
</div>
```

### Card

Standard content container.

```jsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm">
  {/* Header */}
  <div className="px-4 py-3 border-b border-slate-100">
    <h2 className="font-medium text-slate-900">{title}</h2>
  </div>
  {/* Content */}
  <div className="p-4">
    {children}
  </div>
</div>
```

### Stat Card

Dashboard statistics display.

```jsx
<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
  <div className="text-sm text-slate-500 mb-1">{label}</div>
  <div className="text-3xl font-semibold text-slate-900">{value}</div>
  <div className="text-xs text-{color}-600 mt-1">{trend}</div>
</div>
```

### Button Variants

**Primary Button (Dark)**
```jsx
<button className="px-3 py-1.5 text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800">
  {label}
</button>
```

**Primary Button (Blue)**
```jsx
<button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
  {label}
</button>
```

**Secondary Button (Outline)**
```jsx
<button className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
  {label}
</button>
```

**Ghost Button**
```jsx
<button className="text-xs text-slate-400 hover:text-slate-600">
  {label}
</button>
```

**Danger Button**
```jsx
<button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100">
  {label}
</button>
```

### Input Fields

**Search Input (Dark)**
```jsx
<input
  className="w-64 h-8 bg-slate-800 border border-slate-600 rounded-lg px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
/>
```

**Search Input (Light)**
```jsx
<input
  className="w-full h-10 px-4 pl-10 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500"
/>
```

**Select Input**
```jsx
<select className="h-8 px-3 text-sm border border-slate-200 rounded-lg bg-white">
  <option>{option}</option>
</select>
```

### Progress Bar

```jsx
<div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
  <div
    className="h-full bg-blue-500 rounded-full transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Toggle Switch

```jsx
<button className={`relative w-10 h-6 rounded-full transition-colors ${
  enabled ? 'bg-blue-600' : 'bg-slate-200'
}`}>
  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
    enabled ? 'left-5' : 'left-1'
  }`} />
</button>
```

### Avatar

**User Avatar (Text)**
```jsx
<div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
  {initials}
</div>
```

**Agent Avatar**
```jsx
<div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
  <span className="text-sm">🤖</span>
</div>
```

### Table

```jsx
<table className="w-full">
  <thead>
    <tr className="bg-slate-50 border-b border-slate-200">
      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
        {header}
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-slate-100">
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 text-sm text-slate-600">{cell}</td>
    </tr>
  </tbody>
</table>
```

### Sidebar Item

```jsx
<button className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
  active
    ? 'bg-slate-200 text-slate-900 font-medium'
    : 'text-slate-600 hover:bg-slate-100'
}`}>
  <span className="flex items-center gap-2">
    <span className="opacity-70">{icon}</span>
    {label}
  </span>
  {badge && (
    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
      {badge}
    </span>
  )}
</button>
```

---

## Layout Patterns

### Application Shell

```jsx
<div className="h-screen flex flex-col bg-slate-100">
  <Header /> {/* h-14 fixed height */}
  <div className="flex-1 flex overflow-hidden">
    <Sidebar /> {/* w-56 fixed width */}
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-{size}">
        {content}
      </div>
    </main>
  </div>
</div>
```

### Header Layout

```jsx
<header className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">
  {/* Left: Logo */}
  {/* Right: Metrics, Search, Avatar */}
</header>
```

### Sidebar Layout

```jsx
<aside className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col">
  <nav className="p-3 space-y-1">
    {/* Primary nav items */}
  </nav>
  <div className="px-3 pt-4">
    {/* Section headers and lists */}
  </div>
  <div className="mt-auto p-3 border-t border-slate-200">
    {/* Footer action */}
  </div>
</aside>
```

### Content Width Constraints

| Class | Usage |
|-------|-------|
| `max-w-2xl` | Narrow forms, setup wizards |
| `max-w-3xl` | Single-column content |
| `max-w-4xl` | Standard content pages |
| `max-w-5xl` | Dashboard, team views |
| `max-w-6xl` | Wide content (schedule, reports) |

### Grid Layouts

**Stats Grid (3 columns)**
```jsx
<div className="grid grid-cols-3 gap-4 mb-8">
  {/* Stat cards */}
</div>
```

**Two-Column Content**
```jsx
<div className="grid grid-cols-2 gap-6">
  {/* Left and right panels */}
</div>
```

**Agent Detail Layout (2/3 + 1/3)**
```jsx
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2 space-y-6">
    {/* Main content */}
  </div>
  <div className="space-y-6">
    {/* Sidebar content */}
  </div>
</div>
```

### List with Dividers

```jsx
<div className="divide-y divide-slate-100">
  {items.map(item => (
    <div className="px-4 py-3 hover:bg-slate-50">
      {/* Item content */}
    </div>
  ))}
</div>
```

---

## Interactive States

### Hover States

| Element | Base | Hover |
|---------|------|-------|
| Sidebar items | `text-slate-600` | `hover:bg-slate-100` |
| Table rows | - | `hover:bg-slate-50` |
| Cards (clickable) | `border-slate-200` | `hover:border-slate-300 hover:shadow-sm` |
| Links (blue) | `text-blue-600` | `hover:text-blue-700` |
| Ghost buttons | `text-slate-400` | `hover:text-slate-600` |
| Primary dark btn | `bg-slate-900` | `hover:bg-slate-800` |
| Primary blue btn | `bg-blue-600` | `hover:bg-blue-700` |
| Secondary btn | - | `hover:bg-slate-50` |
| Danger btn bg | `bg-red-50` | `hover:bg-red-100` |

### Focus States

```css
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid #3b82f6; /* blue-500 */
  outline-offset: 2px;
}
```

Input-specific focus:
```jsx
className="focus:outline-none focus:border-blue-500"
```

### Active States

| Element | Active State |
|---------|-------------|
| Sidebar items | `bg-slate-200 text-slate-900 font-medium` |
| Toggle switch | `bg-blue-600` (on) vs `bg-slate-200` (off) |

### Transition Classes

```jsx
// Standard transition
className="transition-colors"

// Card transitions
className="transition-all"

// Progress bar animations
className="transition-all duration-500"
```

---

## Icons and Visual Elements

### Icon Approach

The application uses a combination of emoji icons and inline SVG icons:

**Emoji Icons** (for tool/category representations)
- Agent: 🤖
- Email/Google: 📧
- CRM/Salesforce: ☁️
- Chat/Slack: 💬
- Charts: 📊
- Document: 📝
- Target/HubSpot: 🎯
- Clipboard/Jira: 📋

**SVG Icons** (for UI actions)

Lightning bolt (logo):
```jsx
<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
</svg>
```

Search:
```jsx
<svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
```

### Icon Containers

**Square (for tools/agents)**
```jsx
<div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
  <span className="text-sm">{emoji}</span>
</div>
```

**Circle (for users)**
```jsx
<div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
  {initials}
</div>
```

### Logo

```jsx
<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
  <svg className="w-5 h-5 text-white">...</svg>
</div>
<span className="text-white font-semibold tracking-tight">AgentOS</span>
```

### Border Radius Scale

| Class | Usage |
|-------|-------|
| `rounded` | Small badges, day indicators |
| `rounded-sm` | Autonomy bars |
| `rounded-md` | Buttons, action items |
| `rounded-lg` | Inputs, icon containers, buttons |
| `rounded-xl` | Cards, panels |
| `rounded-full` | Status dots, avatars, progress bars |

---

## Quick Reference

### Accessibility Features

- Focus visible outlines on interactive elements
- Color contrast maintained for text legibility
- Semantic HTML structure (header, nav, main, aside)
- Button cursor styles
- Form labels and checkbox associations

---

## File References

- **Main Component**: `/src/components/AgentCommandCenter.jsx`
- **Global Styles**: `/src/index.css`
- **Tailwind Config**: `/tailwind.config.js`

---

*Generated for the Agent Command Center (AgentOS) React application.*
