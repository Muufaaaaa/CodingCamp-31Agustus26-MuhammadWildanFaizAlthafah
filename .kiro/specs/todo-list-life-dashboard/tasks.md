# Implementation Plan: To-Do List Life Dashboard

## Overview

Implement a standalone single-page productivity dashboard using only `index.html`, `css/style.css`, and `js/app.js`. No frameworks, no build tools, no backend. All state persists via `localStorage`. The app is structured around five Vanilla JS IIFEs wired together after `DOMContentLoaded`.

---

## Tasks

- [x] 1. Create the HTML skeleton (`index.html`)
  - [x] 1.1 Write the full `index.html` document
    - Add `<!DOCTYPE html>`, `<meta charset>`, viewport meta, and `<title>Personal Productivity Dashboard</title>`
    - Set `data-theme="light"` on `<html>` as the default attribute
    - Add the FOUC-prevention inline `<script>` block **before** the stylesheet `<link>` that reads `localStorage.getItem('theme')` and sets `document.documentElement.setAttribute('data-theme', …)` synchronously
    - Add `<link rel="stylesheet" href="css/style.css">` after the inline script
    - Write a `<header>` containing the theme-toggle button `id="theme-toggle"` with `aria-label="Toggle theme"`
    - Write `<main class="dashboard-grid">` with four `<section class="widget">` children:
      - `id="greeting-widget"`: `<div id="clock">`, `<div id="date-display">`, `<div id="greeting-text" aria-live="polite">`, `<input id="user-name" type="text" aria-label="Your name">`
      - `id="timer-widget"`: `<div id="timer-display" aria-live="polite">`, `<input id="timer-duration" type="number" min="1" max="120" aria-label="Session duration in minutes">`, `<button id="timer-start">`, `<button id="timer-stop">`, `<button id="timer-reset">`
      - `id="todo-widget"`: `<input id="task-input" type="text" aria-label="New task">`, `<button id="task-add">Add</button>`, `<ul id="task-list">`
      - `id="quicklinks-widget"`: `<div id="links-container">`, `<button id="links-edit-toggle" aria-label="Toggle edit mode">Edit</button>`, `<div id="links-edit-form" hidden>` containing `<input id="link-label-input">`, `<input id="link-url-input" type="url">`, `<button id="link-save">Save</button>`, `<span id="link-validation-msg" role="alert">`
    - Add `<script src="js/app.js"></script>` at end of `<body>`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 5.4_

- [x] 2. Build the CSS stylesheet (`css/style.css`)
  - [x] 2.1 Define CSS custom properties and theme tokens
    - Declare `:root` block with light-theme custom properties: `--color-bg`, `--color-surface`, `--color-primary`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-done`, `--shadow`, `--radius`
    - Declare `[data-theme="dark"]` override block with corresponding dark-theme values
    - Add a CSS reset/base: `*, *::before, *::after { box-sizing: border-box; }`, `body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-text); }`
    - _Requirements: 5.1, 5.2_

  - [x] 2.2 Implement the responsive dashboard grid
    - Style `<header>` to sit above the grid with the theme-toggle button aligned to the right
    - Style `.dashboard-grid` as `display: grid; grid-template-columns: 1fr; gap: 1.25rem; padding: 1.25rem;` (mobile-first, single column)
    - Add `@media (min-width: 768px)` breakpoint that switches to `grid-template-columns: 1fr 1fr` (2-column × 2-row)
    - Style `.widget` using `var(--color-surface)`, `var(--shadow)`, `var(--radius)`, and appropriate padding
    - _Requirements: 6.1, 6.5, 6.6_

  - [x] 2.3 Style widget components and interactive states
    - Style the clock/date/greeting text hierarchy with font sizes and `var(--color-text-muted)` for secondary text
    - Style `#timer-display` with a large monospace font
    - Style `input[type="text"]`, `input[type="number"]`, `input[type="url"]` with `var(--color-border)` border, `var(--color-surface)` background, and `var(--color-text)` color
    - Style buttons (primary, ghost variants) using `var(--color-primary)`
    - Style `.task-item` as a flex row; style `.task-item.done .task-label` with `text-decoration: line-through; color: var(--color-done)`
    - Style `.link-btn` as an anchor-button, `.link-item` as inline-flex
    - Style `#link-validation-msg` in a warning/error color
    - Style `#theme-toggle` icon or text to indicate current state
    - _Requirements: 3.5, 4.1, 5.1, 5.2_

- [x] 3. Checkpoint — HTML + CSS foundation
  - Open `index.html` in a browser and confirm: grid layout switches at 768 px, all widget sections are present, dark mode applies immediately via the FOUC script, and no JavaScript errors appear in the console.

- [x] 4. Implement the `Theme` IIFE (`js/app.js` — begin file)
  - [x] 4.1 Write the `Theme` IIFE with `_apply()` and `init()`
    - Open `js/app.js`; at the top write `'use strict';`
    - Implement `const Theme = (() => { … })();` with:
      - `const KEY = 'theme';`
      - `_apply(theme)`: sets `document.documentElement.setAttribute('data-theme', theme)` and calls `localStorage.setItem(KEY, theme)`
      - `init()`: attaches a `click` listener on `#theme-toggle` that reads current `data-theme`, computes the opposite, and calls `_apply()`
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ]* 4.2 Write property test for Theme toggle round-trip
    - **Property 19: Theme toggle is its own inverse and persists**
    - **Validates: Requirements 5.2, 5.3**
    - In a test script or browser console, set `data-theme` to "light", trigger two clicks on `#theme-toggle`, and assert the DOM attribute and `localStorage.getItem('theme')` return to "light"

- [x] 5. Implement the `Greeting` IIFE
  - [x] 5.1 Write the `Greeting` IIFE with `_getPrefix`, `_formatDate`, `_formatTime`, `_tick`, and `init()`
    - Implement `const Greeting = (() => { … })();` with:
      - `const KEY = 'userName';` and `let intervalId = null;`
      - `_getPrefix(hour)`: returns "Good morning" for hours 5–11, "Good afternoon" for 12–17, "Good evening" otherwise
      - `_formatDate(date)`: uses `date.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })`
      - `_formatTime(date)`: uses `date.toLocaleTimeString('en-GB', { hour12: false })`
      - `_tick()`: updates `#clock`, `#date-display`, `#greeting-text` with current time, date, and greeting
      - `init()`: loads `localStorage.getItem(KEY)` → populates `#user-name`, attaches `blur` listener to persist name, calls `_tick()`, starts `setInterval(_tick, 1000)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [ ]* 5.2 Write property test for greeting prefix coverage
    - **Property 1: Greeting prefix covers every hour of the day**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - Iterate hours 0–23 and assert `_getPrefix(h)` returns exactly one of the three expected strings per the defined ranges; no hour should fall through unmatched

  - [ ]* 5.3 Write property test for date format completeness
    - **Property 2: Date format always contains required components**
    - **Validates: Requirements 1.2**
    - Generate a representative set of `Date` objects and assert that `_formatDate(d)` always contains a weekday name, numeric day, month name, and four-digit year

  - [ ]* 5.4 Write property test for user name round-trip
    - **Property 3: User name round-trip through localStorage**
    - **Validates: Requirements 1.7, 1.8**
    - Set various strings in `#user-name`, trigger `blur`, assert `localStorage.getItem('userName')` matches; then simulate a fresh `init()` and assert the field is repopulated

- [x] 6. Implement the `Timer` IIFE
  - [x] 6.1 Write the `Timer` IIFE with `_format`, `_render`, `_beep`, `_start`, `_stop`, `_reset`, and `init()`
    - Implement `const Timer = (() => { … })();` with:
      - `let remaining`, `let intervalId = null`, `let isRunning = false`, `let audioCtx = null`
      - `_format(seconds)`: zero-pads minutes and seconds to produce `MM:SS`
      - `_render()`: sets `#timer-display.textContent = _format(remaining)`
      - `_beep()`: lazily creates `AudioContext` (falls back to `webkitAudioContext`); creates `OscillatorNode` (sine, 880 Hz) connected through a `GainNode` with exponential ramp to silence over 0.5 s; graceful no-op if `AudioContext` is unavailable
      - `_stop()`: clears interval, sets `isRunning = false`, re-enables `#timer-duration`
      - `_start()`: guards `isRunning` and `remaining <= 0`; disables `#timer-duration`; starts `setInterval` that decrements `remaining`, calls `_render()`, and calls `_stop()` + `_beep()` when `remaining === 0`
      - `_reset()`: calls `_stop()`, reads `#timer-duration.value`, sets `remaining = dur * 60`, calls `_render()`
      - `init()`: reads `localStorage.getItem(KEY)`; clamps to [1, 120] or defaults to 25; sets `#timer-duration.value` and `remaining`; wires Start/Stop/Reset buttons; wires `change` event on `#timer-duration` (update `remaining` if not running); wires `blur` event to persist duration
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

  - [ ]* 6.2 Write property test for timer display format
    - **Property 4: Timer display format is always MM:SS**
    - **Validates: Requirements 2.1**
    - For a sample of integer seconds values in [0, 7200], assert `_format(s)` matches `^\d{2}:\d{2}$` and the arithmetic is correct

  - [ ]* 6.3 Write property test for reset restoring configured duration
    - **Property 5: Reset always restores configured duration**
    - **Validates: Requirements 2.4**
    - Set various durations, run the timer for a few ticks, call `_reset()`, assert `remaining === dur * 60` and `#timer-display` shows `_format(dur * 60)`

  - [ ]* 6.4 Write property test for timer duration round-trip
    - **Property 6: Duration input round-trip through localStorage**
    - **Validates: Requirements 2.8, 2.9**
    - Enter various valid durations, trigger `blur`, assert `localStorage.getItem('timerDuration')` equals the string value; simulate `init()` and assert `remaining` is set correctly

- [x] 7. Checkpoint — Theme, Greeting, Timer
  - Verify in-browser: theme persists across reload, clock ticks every second, greeting prefix changes correctly, timer countdown starts/stops/resets, beep plays at 00:00, duration persists on blur.

- [x] 8. Implement the `TodoList` IIFE
  - [x] 8.1 Write the `TodoList` IIFE with `_save`, `_render`, `_esc`, `_add`, `_toggle`, `_delete`, `_edit`, and `init()`
    - Implement `const TodoList = (() => { … })();` with:
      - `let tasks = [];`
      - `_save()`: `localStorage.setItem('tasks', JSON.stringify(tasks))`
      - `_esc(str)`: escapes `"`, `<`, `>` for safe HTML attribute injection
      - `_render()`: clears `#task-list`; for each task appends a `<li class="task-item [done]" data-id="…">` containing a checkbox, `.task-label` text input, and `.task-delete` button with `aria-label="Delete task"`; adds `done` class when `task.done === true`
      - `_add(text)`: trims; ignores empty; pushes `{ id: Date.now(), text, done: false }`; calls `_save()` and `_render()`
      - `_toggle(id)`: finds task by numeric id, flips `done`, calls `_save()` and `_render()`
      - `_delete(id)`: filters out by numeric id, calls `_save()` and `_render()`
      - `_edit(id, newText)`: updates `text` in place, calls `_save()` (no re-render)
      - `init()`: wraps `JSON.parse(localStorage.getItem('tasks'))` in try/catch defaulting to `[]`; calls `_render()`; attaches Add button click and Enter keydown on `#task-input`; attaches event-delegated `change` (checkbox), `click` (delete), and `blur` (label edit, capture phase) listeners on `#task-list`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 8.2 Write property test for add grows list by one
    - **Property 7: Adding a non-empty task grows the list by exactly one**
    - **Validates: Requirements 3.2**
    - For various initial task arrays and non-empty strings, assert `_add(text)` increases `tasks.length` by 1 and the new element has the trimmed text and `done: false`

  - [ ]* 8.3 Write property test for whitespace rejection
    - **Property 8: Whitespace-only inputs are rejected**
    - **Validates: Requirements 3.3**
    - For strings like `""`, `"   "`, `"\t"`, assert `_add(str)` leaves the array length unchanged

  - [ ]* 8.4 Write property test for rendered task structure
    - **Property 9: Rendered task structure is complete for every task**
    - **Validates: Requirements 3.4**
    - After `_render()` on a non-empty array, assert each `<li>` in `#task-list` contains exactly one checkbox, one `.task-label`, and one `.task-delete`

  - [ ]* 8.5 Write property test for completion toggle as inverse
    - **Property 10: Completion toggle is its own inverse**
    - **Validates: Requirements 3.5**
    - For each task, call `_toggle(id)` twice; assert `done` returns to its original value; also assert the `<li>` has class `done` when `done === true`

  - [ ]* 8.6 Write property test for task deletion
    - **Property 11: Task deletion reduces list length by one and removes the task**
    - **Validates: Requirements 3.6**
    - For arrays of various lengths, call `_delete(id)` and assert length is N − 1 and the id is gone

  - [ ]* 8.7 Write property test for localStorage mirroring task state
    - **Property 12: localStorage always mirrors in-memory task state**
    - **Validates: Requirements 3.7, 3.8**
    - After each of `_add`, `_toggle`, `_delete`, `_edit`, assert `JSON.parse(localStorage.getItem('tasks'))` deeply equals the current in-memory `tasks` array

  - [ ]* 8.8 Write property test for task round-trip through localStorage
    - **Property 13: Tasks round-trip through localStorage preserving order**
    - **Validates: Requirements 3.9**
    - Serialize an ordered task array to `localStorage`, call `init()`, and assert the in-memory array matches in order, text, and done values

- [x] 9. Implement the `QuickLinks` IIFE
  - [x] 9.1 Write the `QuickLinks` IIFE with `_isValidUrl`, `_save`, `_render`, `_addLink`, `_deleteLink`, and `init()`
    - Implement `const QuickLinks = (() => { … })();` with:
      - `const DEFAULTS` array of 3 links (Google, GitHub, YouTube)
      - `let links = [];`, `let editMode = false;`
      - `_isValidUrl(str)`: try/catch around `new URL(str)`, requiring `protocol === 'http:'` or `'https:'`
      - `_save()`: `localStorage.setItem('quickLinks', JSON.stringify(links))`
      - `_render()`: rebuilds `#links-container`; each link is a `<span class="link-item" data-id="…">` containing an `<a class="link-btn" href target="_blank" rel="noopener noreferrer">`; in `editMode` appends a `.link-delete` button with `aria-label="Delete {label}"`; toggles `#links-edit-form` visibility and `#links-edit-toggle` text ("Edit"/"Done")
      - `_addLink(label, url)`: validates both fields and URL format; sets `#link-validation-msg.textContent` on failure; on success pushes new link, calls `_save()`, clears form inputs, calls `_render()`
      - `_deleteLink(id)`: filters out by id, calls `_save()` and `_render()`
      - `init()`: wraps `JSON.parse(localStorage.getItem('quickLinks'))` in try/catch; falls back to `DEFAULTS` if null or non-array; calls `_render()`; wires `#links-edit-toggle` click and `#link-save` click
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

  - [ ]* 9.2 Write property test for link buttons opening in new tab
    - **Property 14: All rendered link buttons open in a new tab**
    - **Validates: Requirements 4.1**
    - After `_render()`, assert every `<a class="link-btn">` has `target="_blank"`, `rel` containing `"noopener"`, and `href` matching its data

  - [ ]* 9.3 Write property test for edit mode delete control count
    - **Property 15: Edit mode shows exactly N delete controls for N links**
    - **Validates: Requirements 4.5**
    - Set `editMode = true`, call `_render()` with arrays of various lengths N, assert exactly N `.link-delete` elements appear

  - [ ]* 9.4 Write property test for adding a valid link
    - **Property 16: Adding a valid link grows the list and persists**
    - **Validates: Requirements 4.6, 4.9**
    - For various valid (label, url) pairs, call `_addLink`, assert length increases by 1 and `localStorage.getItem('quickLinks')` reflects the update

  - [ ]* 9.5 Write property test for invalid link rejection
    - **Property 17: Invalid link inputs are rejected with a message**
    - **Validates: Requirements 4.7**
    - For empty label, empty URL, and invalid URL strings, call `_addLink` and assert the links array is unchanged and `#link-validation-msg` is non-empty

  - [ ]* 9.6 Write property test for link deletion
    - **Property 18: Link deletion reduces list by one and persists**
    - **Validates: Requirements 4.8, 4.9**
    - For arrays of length N ≥ 1, call `_deleteLink(id)`, assert length is N − 1 and id is absent, and localStorage is updated

  - [ ]* 9.7 Write property test for links round-trip through localStorage
    - **Property 20: Stored links round-trip through localStorage**
    - **Validates: Requirements 4.10**
    - Serialize a links array to `localStorage`, call `init()`, assert in-memory array matches in order, label, and url

- [x] 10. Wire all IIFEs together and add `DOMContentLoaded` bootstrap
  - [x] 10.1 Add the top-level `DOMContentLoaded` listener at the bottom of `js/app.js`
    - After all five IIFE declarations, add:
      ```js
      document.addEventListener('DOMContentLoaded', () => {
        Theme.init();
        Greeting.init();
        Timer.init();
        TodoList.init();
        QuickLinks.init();
      });
      ```
    - _Requirements: 6.2, 6.4_

- [x] 11. Final checkpoint — full integration
  - Open `index.html` directly from the filesystem (`file://`) in Chrome, Firefox, Edge, and Safari
  - Verify: FOUC prevention works on reload, all five modules initialize without console errors, localStorage keys (`userName`, `timerDuration`, `tasks`, `quickLinks`, `theme`) persist correctly across page reloads, grid switches between 1-column and 2-column at 768 px, timer beep fires at 00:00, event delegation handles dynamically added tasks and links, URL validation blocks invalid quick-link submissions, and aria attributes are present on interactive elements

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster build; the app is fully functional without them
- Property tests can be written as simple in-browser console scripts or plain `.test.js` files using no test runner — just `console.assert`
- The FOUC prevention script in `<head>` is the only piece of code outside `app.js`; keep it minimal
- `AudioContext` is created lazily on the first `_start()` click to comply with browser autoplay policy
- Event delegation (capture-phase `blur` for task labels) avoids re-attaching listeners on every `_render()` call

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "4.1"] },
    { "id": 3, "tasks": ["4.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8", "9.1"] },
    { "id": 7, "tasks": ["9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "10.1"] }
  ]
}
```
