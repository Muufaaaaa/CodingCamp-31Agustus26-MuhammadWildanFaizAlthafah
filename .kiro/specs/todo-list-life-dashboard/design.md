# Design Document — To-Do List Life Dashboard

## Overview

A standalone, single-page web application built with pure HTML, CSS, and Vanilla JavaScript. No build tools, no frameworks, no backend. All state is persisted via the browser's `localStorage` API. The app is structured across three files: `index.html`, `css/style.css`, and `js/app.js`.

---

## File Structure

```
index.html
css/
  style.css
js/
  app.js
```

No external dependencies. All assets are self-contained; the app operates correctly over `file://` URLs and without an internet connection.

---

## Architecture

### Module Organisation (`js/app.js`)

`app.js` is organised as a collection of module-like IIFEs (Immediately Invoked Function Expressions), one per widget. Each IIFE owns its own DOM references, state, and localStorage interaction. A thin top-level initialiser calls each module's `init()` in sequence after `DOMContentLoaded`.

```js
// Structural sketch — each widget is its own IIFE
const Greeting  = (() => { /* ... */ return { init }; })();
const Timer     = (() => { /* ... */ return { init }; })();
const TodoList  = (() => { /* ... */ return { init }; })();
const QuickLinks = (() => { /* ... */ return { init }; })();
const Theme     = (() => { /* ... */ return { init }; })();

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Greeting.init();
  Timer.init();
  TodoList.init();
  QuickLinks.init();
});
```

### Theme Initialisation (FOUC Prevention)

To prevent a flash of unstyled content, a small inline `<script>` block in the `<head>` (before any stylesheet link) reads `localStorage.getItem('theme')` and sets `document.documentElement.setAttribute('data-theme', …)` synchronously. This runs before the browser has painted any content.

```html
<head>
  <script>
    // FOUC prevention — must be first script in head
    (function () {
      var t = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
  <link rel="stylesheet" href="css/style.css">
  ...
</head>
```

---

## HTML Layout (`index.html`)

```html
<html data-theme="light">
<head>
  <!-- FOUC script (inline, before stylesheet) -->
  <!-- <link> to css/style.css -->
  <!-- <meta charset>, viewport, title -->
</head>
<body>
  <header>
    <!-- Theme toggle button: id="theme-toggle" -->
  </header>

  <main class="dashboard-grid">
    <!-- Widget 1 -->
    <section id="greeting-widget" class="widget">
      <div id="clock"></div>          <!-- HH:MM:SS -->
      <div id="date-display"></div>   <!-- Full readable date -->
      <div id="greeting-text"></div>  <!-- "Good morning, Alex" -->
      <input id="user-name" type="text" />
    </section>

    <!-- Widget 2 -->
    <section id="timer-widget" class="widget">
      <div id="timer-display"></div>  <!-- MM:SS -->
      <input id="timer-duration" type="number" min="1" max="120" />
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
    </section>

    <!-- Widget 3 -->
    <section id="todo-widget" class="widget">
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <ul id="task-list"></ul>
    </section>

    <!-- Widget 4 -->
    <section id="quicklinks-widget" class="widget">
      <div id="links-container"></div>
      <button id="links-edit-toggle">Edit</button>
      <!-- Edit Mode form (hidden in normal view) -->
      <div id="links-edit-form" hidden>
        <input id="link-label-input" type="text" placeholder="Label" />
        <input id="link-url-input" type="url" placeholder="https://..." />
        <button id="link-save">Save</button>
        <span id="link-validation-msg" role="alert"></span>
      </div>
    </section>
  </main>

  <script src="js/app.js"></script>
</body>
</html>
```

---

## CSS Design (`css/style.css`)

### Custom Properties (Design Tokens)

```css
:root {
  /* Light theme defaults */
  --color-bg:        #f5f5f5;
  --color-surface:   #ffffff;
  --color-primary:   #4a6fa5;
  --color-text:      #1a1a1a;
  --color-text-muted:#6b7280;
  --color-border:    #e0e0e0;
  --color-done:      #9ca3af;
  --shadow:          0 2px 8px rgba(0,0,0,.08);
  --radius:          12px;
}

[data-theme="dark"] {
  --color-bg:        #1a1a2e;
  --color-surface:   #16213e;
  --color-primary:   #7b9fd4;
  --color-text:      #e2e8f0;
  --color-text-muted:#94a3b8;
  --color-border:    #334155;
  --color-done:      #475569;
  --shadow:          0 2px 8px rgba(0,0,0,.4);
}
```

### Responsive Grid

```css
.dashboard-grid {
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
  /* Single-column default (mobile-first) */
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;  /* 2-column, 2-row */
  }
}
```

### Task Completion Style

```css
.task-item.done .task-label {
  text-decoration: line-through;
  color: var(--color-done);
}
```

---

## JavaScript: Module Designs

### `Theme` IIFE

**State:** none (reads/writes `localStorage.theme`)

**Responsibilities:**
- `init()`: attach `click` listener to `#theme-toggle`
- `_toggle()`: read current `data-theme`, compute next, call `_apply()`
- `_apply(theme)`: set `document.documentElement.dataset.theme = theme`, write to `localStorage`

The inline FOUC script in `<head>` covers initial application; `Theme.init()` only wires up the toggle.

```js
const Theme = (() => {
  const KEY = 'theme';

  function _apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }

  function init() {
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      _apply(current === 'light' ? 'dark' : 'light');
    });
  }

  return { init };
})();
```

---

### `Greeting` IIFE

**State:** `intervalId` (number)

**Local Storage keys:** `userName`

**Responsibilities:**
- `init()`: load stored name → populate `#user-name` → start `setInterval(1000, _tick)`
- `_tick()`: update `#clock` (HH:MM:SS), `#date-display`, `#greeting-text`
- `_getPrefix(hour)`: pure function returning "Good morning" / "Good afternoon" / "Good evening"
- `_formatDate(date)`: pure function returning "Monday, 25 August 2025"
- Attach `blur` listener on `#user-name` → write to `localStorage`

```js
const Greeting = (() => {
  const KEY = 'userName';
  let intervalId = null;

  function _getPrefix(hour) {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function _formatDate(date) {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  function _formatTime(date) {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  }

  function _tick() {
    const now = new Date();
    const name = document.getElementById('user-name').value || 'Your Name';
    document.getElementById('clock').textContent = _formatTime(now);
    document.getElementById('date-display').textContent = _formatDate(now);
    document.getElementById('greeting-text').textContent =
      `${_getPrefix(now.getHours())}, ${name}`;
  }

  function init() {
    const nameEl = document.getElementById('user-name');
    nameEl.value = localStorage.getItem(KEY) || '';
    nameEl.placeholder = 'Your Name';
    nameEl.addEventListener('blur', () => {
      localStorage.setItem(KEY, nameEl.value);
    });
    _tick();
    intervalId = setInterval(_tick, 1000);
  }

  return { init };
})();
```

---

### `Timer` IIFE

**State:** `remaining` (seconds), `intervalId`, `isRunning`

**Local Storage keys:** `timerDuration`

**Web Audio:** `AudioContext` created lazily on first use (satisfies browser autoplay policy)

**Responsibilities:**
- `init()`: load stored duration (default 25) → render display → wire Start/Stop/Reset buttons + blur on duration input
- `_start()`: set `isRunning = true`, disable `#timer-duration`, start `setInterval(1000, _tick)`
- `_stop()`: clear interval, set `isRunning = false`, re-enable input
- `_reset()`: call `_stop()`, restore `remaining` from current duration input value, re-render
- `_tick()`: decrement `remaining` → render → if `remaining === 0`, call `_stop()` + `_beep()`
- `_render()`: format `remaining` as MM:SS → update `#timer-display`
- `_beep()`: create `AudioContext`, `OscillatorNode` (sine, 880 Hz, 0.5 s)
- Duration `change` event: if not running, update `remaining` + render + persist

```js
const Timer = (() => {
  const KEY = 'timerDuration';
  const DEFAULT_DURATION = 25;
  let remaining = DEFAULT_DURATION * 60;
  let intervalId = null;
  let isRunning = false;
  let audioCtx = null;

  function _format(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function _render() {
    document.getElementById('timer-display').textContent = _format(remaining);
  }

  function _beep() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  }

  function _stop() {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    document.getElementById('timer-duration').disabled = false;
  }

  function _start() {
    if (isRunning || remaining <= 0) return;
    isRunning = true;
    document.getElementById('timer-duration').disabled = true;
    intervalId = setInterval(() => {
      remaining--;
      _render();
      if (remaining <= 0) { _stop(); _beep(); }
    }, 1000);
  }

  function _reset() {
    _stop();
    const dur = parseInt(document.getElementById('timer-duration').value, 10) || DEFAULT_DURATION;
    remaining = dur * 60;
    _render();
  }

  function init() {
    const stored = parseInt(localStorage.getItem(KEY), 10);
    const dur = (stored >= 1 && stored <= 120) ? stored : DEFAULT_DURATION;
    document.getElementById('timer-duration').value = dur;
    remaining = dur * 60;
    _render();

    document.getElementById('timer-start').addEventListener('click', _start);
    document.getElementById('timer-stop').addEventListener('click', _stop);
    document.getElementById('timer-reset').addEventListener('click', _reset);
    document.getElementById('timer-duration').addEventListener('change', (e) => {
      if (isRunning) return;
      let v = parseInt(e.target.value, 10);
      if (v < 1) v = 1;
      if (v > 120) v = 120;
      e.target.value = v;
      remaining = v * 60;
      _render();
    });
    document.getElementById('timer-duration').addEventListener('blur', (e) => {
      localStorage.setItem(KEY, e.target.value);
    });
  }

  return { init };
})();
```

---

### `TodoList` IIFE

**State:** `tasks` — array of `{ id, text, done }`

**Local Storage keys:** `tasks`

**Responsibilities:**
- `init()`: load tasks from localStorage → `_render()`; wire Add button and Enter keypress
- `_save()`: `localStorage.setItem('tasks', JSON.stringify(tasks))`
- `_render()`: clear `#task-list` → for each task append a `<li>` containing:
  - `<input type="checkbox">` with `checked` bound to `task.done`
  - `<input type="text" class="task-label">` with `value` bound to `task.text`
  - `<button class="task-delete">`
- `_add(text)`: push `{ id: Date.now(), text, done: false }` → `_save()` → `_render()`
- `_toggle(id)`: flip `done` → `_save()` → `_render()`
- `_delete(id)`: filter out → `_save()` → `_render()`
- `_edit(id, newText)`: update text → `_save()` (no re-render needed; value already in DOM)

Event delegation is used on `#task-list` for checkbox, delete, and label-blur events, keyed by `data-id` attribute.

```js
const TodoList = (() => {
  const KEY = 'tasks';
  let tasks = [];

  function _save() {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  }

  function _render() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item${task.done ? ' done' : ''}`;
      li.dataset.id = task.id;
      li.innerHTML = `
        <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''}>
        <input type="text" class="task-label" value="${_esc(task.text)}">
        <button class="task-delete" aria-label="Delete task">✕</button>
      `;
      list.appendChild(li);
    });
  }

  function _esc(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function _add(text) {
    text = text.trim();
    if (!text) return;
    tasks.push({ id: Date.now(), text, done: false });
    _save();
    _render();
  }

  function _toggle(id) {
    const task = tasks.find(t => t.id === Number(id));
    if (task) { task.done = !task.done; _save(); _render(); }
  }

  function _delete(id) {
    tasks = tasks.filter(t => t.id !== Number(id));
    _save();
    _render();
  }

  function _edit(id, newText) {
    const task = tasks.find(t => t.id === Number(id));
    if (task) { task.text = newText; _save(); }
  }

  function init() {
    try { tasks = JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (_) { tasks = []; }
    _render();

    document.getElementById('task-add').addEventListener('click', () => {
      const input = document.getElementById('task-input');
      _add(input.value);
      input.value = '';
      input.focus();
    });
    document.getElementById('task-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('task-add').click();
    });
    document.getElementById('task-list').addEventListener('change', (e) => {
      if (e.target.classList.contains('task-check')) {
        _toggle(e.target.closest('[data-id]').dataset.id);
      }
    });
    document.getElementById('task-list').addEventListener('click', (e) => {
      if (e.target.classList.contains('task-delete')) {
        _delete(e.target.closest('[data-id]').dataset.id);
      }
    });
    document.getElementById('task-list').addEventListener('blur', (e) => {
      if (e.target.classList.contains('task-label')) {
        _edit(e.target.closest('[data-id]').dataset.id, e.target.value);
      }
    }, true); // capture: true to catch blur bubbling
  }

  return { init };
})();
```

---

### `QuickLinks` IIFE

**State:** `links` — array of `{ id, label, url }`, `editMode` (boolean)

**Local Storage keys:** `quickLinks`

**Default links:**
```js
[
  { id: 1, label: 'Google',  url: 'https://google.com'  },
  { id: 2, label: 'GitHub',  url: 'https://github.com'  },
  { id: 3, label: 'YouTube', url: 'https://youtube.com' }
]
```

**URL Validation:** uses `new URL(str)` in a try/catch; must start with `http://` or `https://`.

**Responsibilities:**
- `init()`: load links → set `editMode = false` → `_render()`; wire edit toggle and save button
- `_save()`: `localStorage.setItem('quickLinks', JSON.stringify(links))`
- `_render()`: rebuild `#links-container` with `<a>` buttons and conditional delete controls; show/hide `#links-edit-form`
- `_addLink(label, url)`: validate → push `{ id: Date.now(), label, url }` → `_save()` → `_render()`
- `_deleteLink(id)`: filter out → `_save()` → `_render()`
- `_isValidUrl(str)`: returns boolean via `new URL(str)` try/catch, requiring `http` or `https` protocol

```js
const QuickLinks = (() => {
  const KEY = 'quickLinks';
  const DEFAULTS = [
    { id: 1, label: 'Google',  url: 'https://google.com'  },
    { id: 2, label: 'GitHub',  url: 'https://github.com'  },
    { id: 3, label: 'YouTube', url: 'https://youtube.com' }
  ];
  let links = [];
  let editMode = false;

  function _isValidUrl(str) {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) { return false; }
  }

  function _save() {
    localStorage.setItem(KEY, JSON.stringify(links));
  }

  function _render() {
    const container = document.getElementById('links-container');
    container.innerHTML = '';
    links.forEach(link => {
      const wrap = document.createElement('span');
      wrap.className = 'link-item';
      wrap.dataset.id = link.id;
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.label;
      a.className = 'link-btn';
      wrap.appendChild(a);
      if (editMode) {
        const del = document.createElement('button');
        del.textContent = '✕';
        del.className = 'link-delete';
        del.setAttribute('aria-label', `Delete ${link.label}`);
        del.addEventListener('click', () => { _deleteLink(link.id); });
        wrap.appendChild(del);
      }
      container.appendChild(wrap);
    });
    document.getElementById('links-edit-form').hidden = !editMode;
    document.getElementById('links-edit-toggle').textContent = editMode ? 'Done' : 'Edit';
  }

  function _addLink(label, url) {
    const msgEl = document.getElementById('link-validation-msg');
    if (!label.trim()) { msgEl.textContent = 'Label is required.'; return; }
    if (!url.trim())   { msgEl.textContent = 'URL is required.'; return; }
    if (!_isValidUrl(url)) { msgEl.textContent = 'Please enter a valid URL (http/https).'; return; }
    msgEl.textContent = '';
    links.push({ id: Date.now(), label: label.trim(), url: url.trim() });
    _save();
    document.getElementById('link-label-input').value = '';
    document.getElementById('link-url-input').value = '';
    _render();
  }

  function _deleteLink(id) {
    links = links.filter(l => l.id !== id);
    _save();
    _render();
  }

  function init() {
    try { links = JSON.parse(localStorage.getItem(KEY)); }
    catch (_) { links = null; }
    if (!links || !Array.isArray(links)) links = DEFAULTS;
    _render();

    document.getElementById('links-edit-toggle').addEventListener('click', () => {
      editMode = !editMode;
      _render();
    });
    document.getElementById('link-save').addEventListener('click', () => {
      _addLink(
        document.getElementById('link-label-input').value,
        document.getElementById('link-url-input').value
      );
    });
  }

  return { init };
})();
```

---

## Data Models

### `tasks` (localStorage key)

```json
[
  { "id": 1691234567890, "text": "Write report", "done": false },
  { "id": 1691234568000, "text": "Review PR",    "done": true  }
]
```

### `quickLinks` (localStorage key)

```json
[
  { "id": 1, "label": "Google",  "url": "https://google.com"  },
  { "id": 2, "label": "GitHub",  "url": "https://github.com"  },
  { "id": 3, "label": "YouTube", "url": "https://youtube.com" }
]
```

### `userName` / `timerDuration` / `theme`

Plain string values — no JSON encoding needed.

---

## Error Handling

| Scenario | Handling |
|---|---|
| Malformed JSON in `localStorage.tasks` | `try/catch` in `TodoList.init()` → default to `[]` |
| Malformed JSON in `localStorage.quickLinks` | `try/catch` in `QuickLinks.init()` → default to `DEFAULTS` |
| Stored `timerDuration` out of [1–120] range | Clamped to `DEFAULT_DURATION` (25) in `Timer.init()` |
| Invalid URL in Quick Links form | Inline validation message; no link added |
| Empty task submission | Input trimmed; if empty, ignored; focus retained |
| Empty label/URL in Quick Links save | Inline validation message shown per field |
| `AudioContext` unavailable | `window.AudioContext \|\| window.webkitAudioContext` with graceful no-op if neither present |
| Browser blocks AudioContext before gesture | Context created lazily on first Start click (user gesture satisfies autoplay policy) |

---

## Accessibility

- All interactive controls have descriptive `aria-label` attributes or visible text labels.
- Validation messages use `role="alert"` so screen readers announce errors.
- The theme toggle updates `data-theme` on `<html>`, so all CSS custom-property consumers respond simultaneously.
- Task labels are `<input type="text">` elements, making them natively focusable and editable by keyboard.
- Link buttons are `<a>` elements with `href`, supporting keyboard Tab navigation and Enter activation.
- The grid layout uses semantic `<section>` elements with descriptive `id` attributes.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property Reflection

Before writing the final properties, redundancy was reviewed:

- **1.3, 1.4, 1.5** (morning/afternoon/evening prefix rules) together partition the 24-hour day — they can be consolidated into a single property that covers the full domain.
- **1.7 / 1.8** (name persistence write and read) together form a round-trip — one property captures both.
- **3.2** (add grows list) and **3.4** (render with checkbox/label/delete) are distinct: size vs. structure.
- **3.7 / 3.8** (edit persists + all ops sync storage) — 3.8 subsumes 3.7; one combined property.
- **4.6 / 4.9** (add link grows list + all ops sync storage) — combined into one persistence property.
- **5.2 / 5.3** (toggle flips theme + persists) — combined into one round-trip toggle property.

---

### Property 1: Greeting prefix covers every hour of the day

*For any* integer hour in [0, 23], the `_getPrefix` function SHALL return exactly one of "Good morning", "Good afternoon", or "Good evening" — with "Good morning" for [5, 11], "Good afternoon" for [12, 17], and "Good evening" for all remaining hours.

**Validates: Requirements 1.3, 1.4, 1.5**

---

### Property 2: Date format always contains required components

*For any* `Date` object passed to `_formatDate`, the returned string SHALL contain a valid full weekday name, a numeric day, a full month name, and a four-digit year — with no component missing regardless of the input date.

**Validates: Requirements 1.2**

---

### Property 3: User name round-trip through localStorage

*For any* non-empty string entered into the `#user-name` field and blurred, calling `localStorage.getItem('userName')` immediately after SHALL return that exact string; and re-initialising the Greeting module against that same storage state SHALL populate the field with that same string.

**Validates: Requirements 1.7, 1.8**

---

### Property 4: Timer display format is always MM:SS

*For any* integer `seconds` in the range [0, 7200], the `_format(seconds)` function SHALL return a string matching the pattern `^\d{2}:\d{2}$` where the minutes component is `Math.floor(seconds / 60)` zero-padded to two digits and the seconds component is `seconds % 60` zero-padded to two digits.

**Validates: Requirements 2.1**

---

### Property 5: Reset always restores configured duration

*For any* valid duration `d` in [1, 120] set in the `#timer-duration` input, invoking `_reset()` SHALL set `remaining` to `d * 60` and update `#timer-display` to show `_format(d * 60)`, regardless of how much time had elapsed before the reset.

**Validates: Requirements 2.4**

---

### Property 6: Duration input round-trip through localStorage

*For any* integer `d` in [1, 120] entered into `#timer-duration` and blurred, `localStorage.getItem('timerDuration')` SHALL equal `String(d)`; and re-initialising the Timer module against that storage SHALL set `remaining` to `d * 60` and show that in the display.

**Validates: Requirements 2.8, 2.9**

---

### Property 7: Adding a non-empty task grows the list by exactly one

*For any* existing task array of length N and any non-empty, non-whitespace-only string `text`, calling `_add(text)` SHALL result in a task array of length N + 1 where the last element has `text` equal to the trimmed input and `done` equal to `false`.

**Validates: Requirements 3.2**

---

### Property 8: Whitespace-only inputs are rejected

*For any* string composed entirely of whitespace characters (including the empty string), calling `_add(str)` SHALL leave the task array unchanged (same length and same contents).

**Validates: Requirements 3.3**

---

### Property 9: Rendered task structure is complete for every task

*For any* non-empty task array, after `_render()` every `<li>` element in `#task-list` SHALL contain exactly one `<input type="checkbox">` element, one `<input type="text" class="task-label">` element, and one `<button class="task-delete">` element.

**Validates: Requirements 3.4**

---

### Property 10: Completion toggle is its own inverse

*For any* task with initial `done` state `d`, toggling it twice SHALL result in `done` returning to `d`. Further, when a task has `done === true`, its rendered `<li>` SHALL have the class `done` and the label SHALL have `text-decoration: line-through` applied.

**Validates: Requirements 3.5**

---

### Property 11: Task deletion reduces list length by one and removes the task

*For any* task array of length N ≥ 1 and any valid task `id` in that array, calling `_delete(id)` SHALL produce a task array of length N − 1 that contains no element with that `id`.

**Validates: Requirements 3.6**

---

### Property 12: localStorage always mirrors in-memory task state

*For any* sequence of `_add`, `_toggle`, `_delete`, and `_edit` operations on the task array, after each operation `JSON.parse(localStorage.getItem('tasks'))` SHALL be deeply equal to the current in-memory `tasks` array.

**Validates: Requirements 3.7, 3.8**

---

### Property 13: Tasks round-trip through localStorage preserving order

*For any* ordered array of task objects stored under the key `tasks`, re-initialising `TodoList` SHALL produce an in-memory `tasks` array equal in order, length, `text`, and `done` values to the stored array.

**Validates: Requirements 3.9**

---

### Property 14: All rendered link buttons open in a new tab

*For any* non-empty links array, after `_render()` every `<a class="link-btn">` element in `#links-container` SHALL have `target="_blank"`, `rel` containing `"noopener"`, and `href` equal to the corresponding link's `url`.

**Validates: Requirements 4.1**

---

### Property 15: Edit mode shows exactly N delete controls for N links

*For any* links array of length N, after entering Edit Mode (`editMode = true`) and calling `_render()`, exactly N elements with class `link-delete` SHALL be present in `#links-container`.

**Validates: Requirements 4.5**

---

### Property 16: Adding a valid link grows the list and persists

*For any* non-empty label string and any `http`/`https` URL string, calling `_addLink(label, url)` SHALL increase the links array length by 1, the new element SHALL have `label` and `url` matching the trimmed inputs, and `localStorage.getItem('quickLinks')` SHALL reflect the updated array.

**Validates: Requirements 4.6, 4.9**

---

### Property 17: Invalid link inputs are rejected with a message

*For any* invocation of `_addLink` where the label is empty, the URL is empty, or the URL fails `new URL()` validation, the links array length SHALL remain unchanged and the `#link-validation-msg` element SHALL have non-empty `textContent`.

**Validates: Requirements 4.7**

---

### Property 18: Link deletion reduces list by one and persists

*For any* links array of length N ≥ 1 and any valid link `id` in that array, calling `_deleteLink(id)` SHALL produce a links array of length N − 1 containing no element with that `id`, and `localStorage.getItem('quickLinks')` SHALL reflect the updated array.

**Validates: Requirements 4.8, 4.9**

---

### Property 19: Theme toggle is its own inverse and persists

*For any* starting `data-theme` value `t` ∈ {"light", "dark"}, activating the theme toggle SHALL set `document.documentElement.dataset.theme` to the opposite value and write that opposite value to `localStorage.getItem('theme')`; activating the toggle a second time SHALL restore the original value `t` in both the DOM and localStorage.

**Validates: Requirements 5.2, 5.3**

---

### Property 20: Stored links round-trip through localStorage

*For any* array of link objects stored under the key `quickLinks`, re-initialising `QuickLinks` SHALL produce an in-memory `links` array equal in order, `label`, and `url` to the stored array.

**Validates: Requirements 4.10**
