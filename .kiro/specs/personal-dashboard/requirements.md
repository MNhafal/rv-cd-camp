# Requirements Document

## Introduction

A client-side personal dashboard web app built with HTML, CSS, and Vanilla JavaScript (no frameworks). The dashboard runs entirely in the browser with no backend server. All persistent data is stored via the browser's LocalStorage API. The app provides four main widgets: a time-aware greeting, a 25-minute focus timer, a to-do list, and a quick links panel. It must work in all modern browsers and may be used as a standalone web page or a browser extension.

---

## Glossary

- **Dashboard**: The single-page web application rendered by `index.html`.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-of-day greeting.
- **Timer**: The focus countdown timer component.
- **Todo_Manager**: The component responsible for creating, editing, completing, and deleting tasks.
- **Links_Manager**: The component responsible for storing and displaying quick-link bookmarks.
- **Storage**: The browser's `localStorage` API used to persist all application data.
- **Task**: A single to-do item with a text label, a done/undone state, and an insertion order.
- **Link**: A saved bookmark composed of a user-supplied label and a URL.
- **Modern_Browser**: The latest stable release of Chrome, Firefox, Edge, or Safari at the time of deployment.

---

## Requirements

### Requirement 1: Time-Aware Greeting

**User Story:** As a user, I want to see the current time, date, and a greeting that reflects the time of day, so that the dashboard feels personal and contextually relevant when I open it.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current local time in HH:MM:SS format, updating at least once per second and no more than 1500 milliseconds after each second boundary.
2. THE Greeting_Widget SHALL display the current local date including the weekday name, month name, day, and year.
3. WHILE the local hour is between 05 (inclusive) and 11 (inclusive), THE Greeting_Widget SHALL display the greeting "Good morning".
4. WHILE the local hour is between 12 (inclusive) and 16 (inclusive), THE Greeting_Widget SHALL display the greeting "Good afternoon".
5. WHILE the local hour is between 17 (inclusive) and 20 (inclusive), THE Greeting_Widget SHALL display the greeting "Good evening".
6. WHILE the local hour is 21, 22, 23, 0, 1, 2, 3, or 4, THE Greeting_Widget SHALL display the greeting "Good night".
7. WHEN the local hour crosses a greeting boundary, THE Greeting_Widget SHALL update the displayed greeting within 1500 milliseconds without requiring a page reload.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can track focused work sessions without leaving the dashboard.

#### Acceptance Criteria

1. THE Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the Start control, THE Timer SHALL begin decrementing the displayed countdown by one second per second.
3. WHILE the Timer is running, THE Timer SHALL disable the Start control and enable the Stop control.
4. WHEN the user activates the Stop control, THE Timer SHALL pause the countdown at its current value, disable the Stop control, and enable the Start control.
5. WHEN the user activates the Reset control, THE Timer SHALL stop any active countdown, restore the display to 25:00, enable the Start control, and disable the Stop control.
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically, disable the Stop control, enable the Start control, and display a visible completion message within the Timer component.
7. THE Timer SHALL display the remaining time in MM:SS format at all times.

---

### Requirement 3: To-Do List — Adding Tasks

**User Story:** As a user, I want to add tasks to a list, so that I can track what I need to do during my work session.

#### Acceptance Criteria

1. THE Todo_Manager SHALL provide a text input field accepting a task label of up to 120 characters.
2. WHEN the user submits the add-task form with a non-empty label, THE Todo_Manager SHALL append the new Task to the task list and persist the updated list to Storage.
3. WHEN the user submits the add-task form with an empty or whitespace-only label, THE Todo_Manager SHALL not add a Task to the list and SHALL display an inline validation message indicating that the task text cannot be empty.
4. WHEN a new Task is added, THE Todo_Manager SHALL clear the text input field and return focus to it.
5. IF the task list contains no Tasks, THEN THE Todo_Manager SHALL display an empty-state message reading "No tasks have been added yet."
6. IF the user attempts to submit a label exceeding 120 characters, THEN THE Todo_Manager SHALL reject the submission and display an inline validation message indicating the character limit.
7. IF a Storage write operation fails when adding a Task, THEN THE Todo_Manager SHALL display an error message indicating that the task could not be saved and retain the Task in the in-memory list.

---

### Requirement 4: To-Do List — Editing Tasks

**User Story:** As a user, I want to edit the text of an existing task, so that I can correct or update a task without deleting and recreating it.

#### Acceptance Criteria

1. WHEN the user double-clicks on a Task label, THE Todo_Manager SHALL replace the task label with an inline text input pre-populated with the current label, accepting up to 200 characters.
2. WHEN the user confirms an edit by pressing Enter or by moving focus away from the inline input, THE Todo_Manager SHALL trim the input value, update the Task label if the trimmed value is non-empty and different from the original trimmed label, then persist the updated list to Storage.
3. WHEN the user cancels an edit by pressing Escape, THE Todo_Manager SHALL discard the change and restore the original label without modifying Storage.
4. IF the user confirms an edit with a value that is empty, whitespace-only, or identical to the original label after trimming, THEN THE Todo_Manager SHALL discard the change and restore the original label without modifying Storage.

---

### Requirement 5: To-Do List — Completing and Deleting Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can keep my list accurate and up to date.

#### Acceptance Criteria

1. WHEN the user activates the completion checkbox on a Task in the pending state, THE Todo_Manager SHALL transition the Task to the done state and persist the updated list to Storage; WHEN the user activates the completion checkbox on a Task in the done state, THE Todo_Manager SHALL transition the Task back to the pending state and persist the updated list to Storage.
2. WHILE a Task is in the done state, THE Todo_Manager SHALL render the task label with a strikethrough style to visually distinguish it from pending tasks.
3. WHEN the user activates the delete control on a Task, THE Todo_Manager SHALL remove that Task from the list and persist the updated list to Storage.
4. THE Todo_Manager SHALL persist all Task data — label, done state, and insertion order — to Storage so that the list is restored in full with its original order after a page reload.
5. IF a Storage write operation fails, THEN THE Todo_Manager SHALL display an error message indicating that the change could not be saved and retain the in-memory state that was applied.

---

### Requirement 6: Quick Links — Adding and Displaying Links

**User Story:** As a user, I want to save links to my favourite websites and open them in a new tab with a single click, so that I can reach important sites quickly from the dashboard.

#### Acceptance Criteria

1. THE Links_Manager SHALL provide a label input field (up to 40 characters) and a URL input field (up to 2048 characters) for adding a new Link.
2. WHEN the user submits the add-link form with both a non-empty label and a valid URL, THE Links_Manager SHALL add the Link to the links panel immediately without a page reload and persist the updated link collection to Storage.
3. WHEN the submitted URL does not begin with `http://` or `https://`, THE Links_Manager SHALL prepend `https://` before storing the URL.
4. WHEN the submitted URL is structurally invalid and cannot be resolved to a valid absolute URL even after prepending `https://`, THE Links_Manager SHALL reject the submission and display an inline validation message indicating that the URL is not valid.
5. IF the user submits the add-link form with an empty label or an empty URL field, THEN THE Links_Manager SHALL not add the Link and SHALL display an inline validation message indicating which field is missing.
6. IF the link collection contains no Links, THEN THE Links_Manager SHALL display an empty-state message informing the user that no links are saved.
7. THE Links_Manager SHALL persist all Link data — label and URL — to Storage so that the collection is saved whenever a Link is added.
8. WHEN the Links_Manager initialises, THE Links_Manager SHALL restore all Link data from Storage so that the collection is displayed in full after a page reload.
9. WHEN the user activates a saved Link, THE Links_Manager SHALL open the corresponding URL in a new browser tab.

---

### Requirement 7: Quick Links — Removing Links

**User Story:** As a user, I want to remove a saved link I no longer need, so that my links panel stays relevant and uncluttered.

#### Acceptance Criteria

1. WHEN the user activates the delete control on a Link, THE Links_Manager SHALL remove that Link from the panel and persist the updated collection to Storage.
2. WHEN the user activates the delete control on a Link that is rendered as an anchor element, THE Links_Manager SHALL prevent the anchor's default navigation before removing the Link.
3. IF Storage is unavailable when persisting the updated collection, THEN THE Links_Manager SHALL retain the removal in the panel display and present an error message indicating the save failure to the user.
4. IF the updated collection cannot be persisted to Storage after removal, THEN THE Links_Manager SHALL preserve the remaining links in the panel without reverting the removal until the page is reloaded.

---

### Requirement 8: Data Persistence via LocalStorage

**User Story:** As a user, I want all my tasks and links to survive a page reload or browser restart, so that I do not lose my data between sessions.

#### Acceptance Criteria

1. WHEN the Todo_Manager or Links_Manager modifies a collection, THE Storage SHALL serialise the updated collection as a JSON string and write it to `localStorage` before the function call returns.
2. WHEN the Dashboard is loaded, THE Storage SHALL deserialise and restore all Task and Link collections from `localStorage`.
3. IF a `localStorage` read operation for one collection throws an error or returns malformed JSON, THEN THE Storage SHALL return an empty collection for that collection only, without affecting the other collection's restore operation.
4. THE Dashboard SHALL use fixed, distinct `localStorage` keys for the Task collection and the Link collection to prevent data collisions between the two stores.
5. IF `localStorage` contains no entry for a given collection key on first load, THEN THE Storage SHALL treat that collection as empty and render the corresponding empty-state message.

---

### Requirement 9: Technical Constraints

**User Story:** As a developer, I want the codebase to follow strict technology and structure constraints, so that the project remains maintainable and dependency-free.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript, with no `<script>` tags referencing external CDN-hosted libraries and no `import` statements resolving to third-party packages.
2. THE Dashboard SHALL contain exactly one CSS file located at `css/styles.css` and no other CSS files.
3. THE Dashboard SHALL contain exactly one JavaScript file located at `js/app.js` and no other JavaScript files.
4. THE Dashboard SHALL load and operate without errors in the latest stable release of Chrome, Firefox, Edge, and Safari, verified by opening `index.html` directly from the file system.
5. THE Dashboard SHALL function as a standalone web page loadable by opening `index.html` directly in a browser without a local server, build step, or package installation.

---

### Requirement 10: Non-Functional — Performance and Responsiveness

**User Story:** As a user, I want the dashboard to load instantly and respond to my interactions without noticeable delay, so that it does not interrupt my workflow.

#### Acceptance Criteria

1. THE Dashboard SHALL render all visible elements and make all controls interactive within 1 second of the browser parsing `index.html`, measured on a device with a single-core benchmark score of at least 1000 on Octane 2.0 or equivalent, with no network latency (local file load).
2. WHEN the user initiates an interaction (mousedown, keydown, or touchstart) on any control, THE Dashboard SHALL reflect the resulting DOM change within 100 milliseconds of that interaction event.
3. THE Dashboard SHALL adapt its layout for viewport widths from 320px to 2560px such that no horizontal scrollbar appears and no element is clipped by or visually overlaps another element.
4. IF the initial render exceeds 1 second, THEN THE Dashboard SHALL display a loading indicator within 200 milliseconds of load initiation and complete rendering within 5 seconds.

---

### Requirement 11: Non-Functional — Visual Design and Accessibility

**User Story:** As a user, I want the dashboard to have a clean, readable interface with clear visual hierarchy, so that I can use it comfortably for extended periods.

#### Acceptance Criteria

1. THE Dashboard SHALL apply a consistent colour palette, spacing scale, and typography throughout all widgets, such that no widget deviates in font family, spacing unit, or colour from the defined design tokens.
2. THE Dashboard SHALL maintain a colour contrast ratio of at least 4.5:1 between text and its background for all text elements with font size below 18pt (or 14pt bold), and at least 3:1 for text at or above those sizes, as defined by WCAG 2.1 Level AA.
3. THE Dashboard SHALL provide visible focus indicators on all interactive elements (buttons, inputs, checkboxes, links), where each focus indicator has a minimum contrast ratio of 3:1 between the focused and unfocused states as defined by WCAG 2.1 Level AA criterion 1.4.11.
4. WHEN an interactive element is in a disabled state, THE Dashboard SHALL render the element with a visually distinct style that communicates the disabled state, and SHALL prevent the element from receiving focus or responding to keyboard and pointer input.
5. THE Dashboard SHALL label all icon-only buttons with an `aria-label` attribute whose value describes the button's action in 1–5 words, such that a screen reader announces a recognisable action name with no visible text present.
6. IF an interactive element does not carry a visible text label, THEN THE Dashboard SHALL expose an accessible name via `aria-label` or `aria-labelledby` so that the element is distinguishable from other elements of the same type by assistive technologies.
