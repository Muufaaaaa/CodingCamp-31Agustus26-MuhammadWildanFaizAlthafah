# Requirements Document

## Introduction

A personal productivity dashboard delivered as a standalone single-page web application built with pure HTML, CSS, and Vanilla JavaScript — no build tools, no frameworks, no backend. All persistent state is stored in the browser's Local Storage. The dashboard surfaces four core productivity widgets on one screen: a greeting panel with live clock, a Pomodoro-style focus timer, a to-do list, and a quick-links launcher. A light/dark mode toggle applies a consistent visual theme across all widgets. The app must work in Chrome, Firefox, Edge, and Safari and can be opened directly from the filesystem or served as a browser extension.

---

## Glossary

- **Dashboard**: The single-page web application described by this document.
- **Greeting Section**: The widget that displays the current time, date, and a time-of-day greeting alongside an editable user name.
- **Focus Timer**: The Pomodoro-style countdown timer widget with configurable duration and playback controls.
- **To-Do List**: The task-management widget that allows adding, editing, completing, and deleting tasks.
- **Quick Links**: The bookmarks widget that renders saved URLs as clickable buttons and exposes edit controls in Edit Mode.
- **Edit Mode**: A UI state of the Quick Links widget in which add and delete controls are visible.
- **Local Storage**: The browser-native `localStorage` Web API used as the sole persistence layer.
- **Theme**: The active color scheme of the Dashboard, either "light" or "dark".
- **Task**: A single to-do item stored in Local Storage with a text label and a completion state.
- **Link**: A Quick Links entry composed of a display label and a URL stored in Local Storage.

---

## Requirements

### Requirement 1 — Live Greeting Section

**User Story:** As a user, I want to see the current time, date, and a personalized greeting so that I always have immediate context when I open the dashboard.

#### Acceptance Criteria

1. THE Greeting Section SHALL display the current local time in HH:MM:SS format, updating every second without requiring a page reload.
2. THE Greeting Section SHALL display the current local date in a human-readable format that includes the full weekday name, day, month, and year (e.g., "Monday, 25 August 2025").
3. WHEN the local time is between 05:00 and 11:59, THE Greeting Section SHALL display the prefix "Good morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting Section SHALL display the prefix "Good afternoon".
5. WHEN the local time is between 18:00 and 23:59 or between 00:00 and 04:59, THE Greeting Section SHALL display the prefix "Good evening".
6. THE Greeting Section SHALL display a user name following the time-of-day prefix to form a complete greeting string (e.g., "Good morning, Alex").
7. WHEN a user edits the name field in the Greeting Section and the field loses focus, THE Greeting Section SHALL persist the entered name to Local Storage under the key `userName`.
8. WHEN the Dashboard loads and Local Storage contains a value for the key `userName`, THE Greeting Section SHALL populate the name field with that stored value.
9. WHEN the Dashboard loads and Local Storage does not contain a value for the key `userName`, THE Greeting Section SHALL populate the name field with the placeholder text "Your Name".

---

### Requirement 2 — Focus Timer

**User Story:** As a user, I want a configurable countdown timer so that I can work in focused sessions without being constrained to a fixed duration.

#### Acceptance Criteria

1. THE Focus Timer SHALL display the remaining time in MM:SS format at all times.
2. THE Focus Timer SHALL provide a Start control that begins the countdown from the currently displayed remaining time.
3. THE Focus Timer SHALL provide a Stop control that pauses the countdown at the current remaining time without resetting it.
4. THE Focus Timer SHALL provide a Reset control that stops the countdown and restores the displayed time to the configured session duration.
5. THE Focus Timer SHALL provide a numeric input field that accepts a session duration value in whole minutes within the range 1–120.
6. WHEN a user changes the value in the duration input field while the timer is not running, THE Focus Timer SHALL update the displayed remaining time to match the new duration.
7. WHEN the countdown reaches 00:00, THE Focus Timer SHALL stop the countdown automatically and play a browser-native audio alert using the Web Audio API.
8. WHEN a user changes the duration input value and the field loses focus, THE Focus Timer SHALL persist the new duration in minutes to Local Storage under the key `timerDuration`.
9. WHEN the Dashboard loads and Local Storage contains a value for the key `timerDuration`, THE Focus Timer SHALL initialise the duration input and remaining time display with that stored value.
10. WHEN the Dashboard loads and Local Storage does not contain a value for the key `timerDuration`, THE Focus Timer SHALL initialise the duration input to 25 minutes.
11. WHILE the countdown is running, THE Focus Timer SHALL disable the duration input field to prevent mid-session changes.

---

### Requirement 3 — To-Do List

**User Story:** As a user, I want to manage a list of tasks so that I can track what needs to be done during the day.

#### Acceptance Criteria

1. THE To-Do List SHALL provide a text input field and an "Add" control for entering new tasks.
2. WHEN a user submits a non-empty task via the Add control or by pressing the Enter key while the task input field is focused, THE To-Do List SHALL append the new task to the list and clear the input field.
3. IF a user attempts to submit an empty task string, THEN THE To-Do List SHALL ignore the submission and retain focus on the task input field.
4. THE To-Do List SHALL render each task with a checkbox, an editable label, and a delete control.
5. WHEN a user activates the checkbox of a task, THE To-Do List SHALL toggle the task's completion state and apply a visual strikethrough to the task label.
6. WHEN a user activates the delete control of a task, THE To-Do List SHALL remove that task from the list.
7. WHEN a user edits the label of a task and the label field loses focus, THE To-Do List SHALL persist the updated label text to Local Storage.
8. THE To-Do List SHALL persist all tasks, including their labels and completion states, to Local Storage under the key `tasks` as a JSON array after every add, edit, toggle, or delete operation.
9. WHEN the Dashboard loads and Local Storage contains a value for the key `tasks`, THE To-Do List SHALL render the stored tasks in the order they were saved.
10. WHEN the Dashboard loads and Local Storage does not contain a value for the key `tasks`, THE To-Do List SHALL render an empty list.

---

### Requirement 4 — Quick Links

**User Story:** As a user, I want to save favorite website links as clickable buttons so that I can navigate to frequently used pages in one click.

#### Acceptance Criteria

1. THE Quick Links widget SHALL render each saved Link as a button that opens the associated URL in a new browser tab when activated.
2. THE Quick Links widget SHALL provide an "Edit Mode" toggle control that switches the widget between normal view and Edit Mode.
3. WHILE the Quick Links widget is in normal view, THE Quick Links widget SHALL display only the link buttons and the Edit Mode toggle control, with no add or delete controls visible.
4. WHILE the Quick Links widget is in Edit Mode, THE Quick Links widget SHALL display an add-link form containing a label input field, a URL input field, and a Save control.
5. WHILE the Quick Links widget is in Edit Mode, THE Quick Links widget SHALL display a delete control adjacent to each link button.
6. WHEN a user activates the Save control in Edit Mode with both a non-empty label and a valid URL, THE Quick Links widget SHALL append the new Link to the list.
7. IF a user activates the Save control in Edit Mode with an empty label or an empty URL field, THEN THE Quick Links widget SHALL display an inline validation message and not add the link.
8. WHEN a user activates the delete control of a Link, THE Quick Links widget SHALL remove that Link from the list.
9. THE Quick Links widget SHALL persist all Links to Local Storage under the key `quickLinks` as a JSON array after every add or delete operation.
10. WHEN the Dashboard loads and Local Storage contains a value for the key `quickLinks`, THE Quick Links widget SHALL render the stored Links.
11. WHEN the Dashboard loads and Local Storage does not contain a value for the key `quickLinks`, THE Quick Links widget SHALL render a set of three default Links: "Google" (https://google.com), "GitHub" (https://github.com), and "YouTube" (https://youtube.com).

---

### Requirement 5 — Light / Dark Mode

**User Story:** As a user, I want to toggle between light and dark color schemes so that the dashboard is comfortable to use in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control that switches the active Theme between "light" and "dark".
2. WHEN a user activates the theme toggle, THE Dashboard SHALL apply the selected Theme to all widgets simultaneously without requiring a page reload.
3. THE Dashboard SHALL persist the active Theme selection to Local Storage under the key `theme` each time the toggle is activated.
4. WHEN the Dashboard loads and Local Storage contains a value for the key `theme`, THE Dashboard SHALL apply that stored Theme immediately on load before rendering any content, preventing a flash of unstyled content.
5. WHEN the Dashboard loads and Local Storage does not contain a value for the key `theme`, THE Dashboard SHALL apply the "light" Theme as the default.

---

### Requirement 6 — Layout and Structure

**User Story:** As a user, I want all widgets visible on a single screen so that I can access every feature without scrolling or navigating between pages.

#### Acceptance Criteria

1. THE Dashboard SHALL arrange the Greeting Section, Focus Timer, To-Do List, and Quick Links widgets in a CSS Grid layout on a single page.
2. THE Dashboard SHALL be delivered as three files with the paths `index.html`, `css/style.css`, and `js/app.js` — all other presentational and interactive logic MUST reside in these files.
3. THE Dashboard SHALL load and operate correctly without an active internet connection, relying solely on files present in the delivery package.
4. THE Dashboard SHALL load and operate correctly when opened directly from the local filesystem via a `file://` URL in Chrome, Firefox, Edge, and Safari.
5. WHEN the viewport width is 768 px or wider, THE Dashboard SHALL display the four widgets in a two-column, two-row CSS Grid.
6. WHEN the viewport width is below 768 px, THE Dashboard SHALL display the four widgets in a single-column stack.
