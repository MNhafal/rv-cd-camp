# Implementation Plan: Personal Dashboard

## Overview

Implement a client-side personal dashboard as three files — `index.html`, `css/styles.css`, and `js/app.js` — with no build tools, no frameworks, and no external production dependencies. The JavaScript is structured as four IIFEs (`initGreeting`, `initTimer`, `initTodo`, `initLinks`), each following a validate → persist → render cycle. A companion `js/logic.js` module extracts pure functions for property-based testing with Vitest and fast-check.

---

## Tasks

- [ ] 1. Scaffold HTML structure and CSS design tokens
  - Write the complete `index.html` with all widget sections: greeting header, focus timer card, to-do list card, and quick links card
  - Include all semantic landmarks (`<header>`, `<main>`, `<section>`), ARIA roles, and `aria-label` attributes on icon-only controls
  - Wire the `<link>` to `css/styles.css` and the `<script>` to `js/app.js`
  - In `css/styles.css`, define all CSS custom properties (design tokens): `--bg`, `--surface`, `--surface-2`, `--border`, `--accent`, `--accent-dark`, `--danger`, `--success`, `--text`, `--text-muted`, `--radius`, `--shadow`, `--font`
  - Implement base reset, body typography, grid layout, card styles, button variants (`btn-primary`, `btn-secondary`, `btn-ghost`), disabled-state styles, and focus-ring styles meeting WCAG 2.1 AA 3:1 contrast
  - Implement responsive layout: single-column at ≤ 480 px, fluid grid above that; no horizontal scroll from 320 px to 2560 px
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.3, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 2. Implement Greeting widget (`initGreeting`)
  - [ ] 2.1 Implement `getGreeting(hour)` and `formatTime(date)` pure functions in `js/logic.js`
    - `getGreeting`: map hour 5–11 → "Good morning", 12–16 → "Good afternoon", 17–20 → "Good evening", 21/22/23/0–4 → "Good night" (include emoji variants as per design)
    - `formatTime` for greeting: derive HH:MM:SS string from a `Date` object using `toLocaleTimeString`
    - Export both functions from `js/logic.js`
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write property test for greeting coverage (Property 1)
    - **Property 1: Greeting coverage — every hour maps to exactly one greeting**
    - Use `fc.integer({min:0, max:23})` — assert exactly one of four greeting strings is returned and boundary matches requirements 1.3–1.6
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [ ] 2.3 Implement `initGreeting` IIFE in `js/app.js`
    - Call `getGreeting` and date/time formatting on each tick
    - Update `#greeting-text` and `#datetime-text` elements
    - Use `setInterval(update, 1000)` and call `update()` immediately on load
    - Display date with weekday, month name, day, and year via `toLocaleDateString`
    - _Requirements: 1.1, 1.2, 1.7_

- [ ] 3. Implement Focus Timer (`initTimer`)
  - [ ] 3.1 Implement `formatTime(seconds)` pure function in `js/logic.js`
    - Accept integer seconds in [0, 1500]; return `"MM:SS"` string with zero-padded components
    - Export from `js/logic.js`
    - _Requirements: 2.7_

  - [ ]* 3.2 Write property test for timer format (Property 2)
    - **Property 2: Timer format produces valid MM:SS strings**
    - Use `fc.integer({min:0, max:1500})` — assert output matches `/^\d{2}:\d{2}$/`, minutes ∈ [0, 25], seconds ∈ [0, 59]
    - **Validates: Requirements 2.7**

  - [ ] 3.3 Implement `initTimer` IIFE in `js/app.js`
    - Manage `remaining` (seconds) and `intervalId` local state
    - Implement `start()`, `stop()`, `reset()`, and `tick()` per the state machine in the design (Idle → Running → Paused/Complete → Idle)
    - On completion: clear interval, set `#timer-display` to "Done! 🎉", disable Stop, enable Start
    - Guard `start()` with `if (intervalId) return` to prevent duplicate intervals
    - Apply/remove `.running` class on `#timer-card` for visual running state
    - Initialise with Stop disabled, display "25:00"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 4. Checkpoint — Greeting and Timer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement To-Do storage and pure logic in `js/logic.js`
  - [ ] 5.1 Implement `loadTasks()` and `saveTasks(tasks)` in `js/logic.js`
    - `loadTasks`: wrap `JSON.parse(localStorage.getItem('dashboard_todos'))` in try/catch; return `[]` on any error or null result
    - `saveTasks`: call `localStorage.setItem('dashboard_todos', JSON.stringify(tasks))`; let quota errors propagate to caller
    - Export both functions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 5.2 Write property test for task storage round-trip (Property 7)
    - **Property 7: Task storage round-trip preserves full fidelity**
    - Use `fc.array(taskArb)` — assert `saveTasks` then `loadTasks` returns deep-equal array
    - **Validates: Requirements 5.4, 8.1, 8.2**

  - [ ]* 5.3 Write property test for malformed JSON resilience (Property 8 — tasks side)
    - **Property 8: Malformed JSON returns empty collection without throwing**
    - Use `fc.string().filter(...)` for non-JSON strings — assert `loadTasks()` returns `[]` without throwing
    - **Validates: Requirements 8.3**

  - [ ] 5.4 Implement `addTask(text, tasks)`, `deleteTask(id, tasks)`, `toggleDone(id, tasks)`, and `commitEdit(id, newText, tasks)` pure functions in `js/logic.js`
    - `addTask`: append `{id: Date.now(), text: text.trim(), done: false}`; return new array
    - `deleteTask`: filter out task with matching id; return new array
    - `toggleDone`: map task with matching id, flip `done`; return new array
    - `commitEdit`: trim `newText`; if non-empty and different from original, update text; otherwise return array unchanged
    - Export all four functions
    - _Requirements: 3.2, 4.2, 4.3, 4.4, 5.1, 5.3_

  - [ ]* 5.5 Write property test for task addition round-trip (Property 3)
    - **Property 3: Task addition round-trip**
    - Use `fc.string({minLength:1}).filter(s=>s.trim().length>0).map(s=>s.substring(0,120))` — assert list length +1, task in `loadTasks()` with trimmed text and `done: false`
    - **Validates: Requirements 3.2, 5.4, 8.1**

  - [ ]* 5.6 Write property test for whitespace task rejection (Property 4)
    - **Property 4: Whitespace task rejection**
    - Use `fc.stringOf(fc.constantFrom(' ','\t','\n'))` — assert stored array unchanged
    - **Validates: Requirements 3.3**

  - [ ]* 5.7 Write property test for toggle involution (Property 5)
    - **Property 5: Task completion toggle is an involution**
    - Use `fc.record({id:fc.nat(), text:fc.string(), done:fc.boolean()})` — assert double-toggle returns original `done` value
    - **Validates: Requirements 5.1**

  - [ ]* 5.8 Write property test for task deletion (Property 6)
    - **Property 6: Task deletion reduces list by exactly one**
    - Use `fc.array(taskArb, {minLength:1})` + random index — assert length -1, deleted task absent, others intact
    - **Validates: Requirements 5.3**

- [ ] 6. Implement `initTodo` IIFE in `js/app.js`
  - [ ] 6.1 Implement task rendering and empty-state display
    - `renderTasks()`: read from `loadTasks()`, clear `#todo-list`, render each task as `<li>` with checkbox, label `<span>`, edit button, and delete button
    - Show `#todo-empty` when task array is empty; hide it otherwise
    - Apply `.done` class and strikethrough style to completed tasks
    - Set `aria-label` on checkbox ("Mark task complete"), edit button ("Edit task"), delete button ("Delete task")
    - _Requirements: 3.5, 5.2, 11.5, 11.6_

  - [ ] 6.2 Implement add-task form submission with validation and error handling
    - On submit: trim input; if empty or whitespace-only, show inline validation message (req 3.3); if > 120 chars, show character-limit message (req 3.6)
    - Call `addTask` pure function, then `saveTasks`; wrap save in try/catch — on error show inline error message and keep in-memory state (req 3.7)
    - On success: clear input, return focus to input field, call `renderTasks()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_

  - [ ] 6.3 Implement inline editing (double-click), toggle-done, and delete with error handling
    - Double-click on task label: replace `<span>` with `<input class="edit-input">` pre-populated with current text, max 200 chars
    - On Enter or blur: call `commitEdit` pure function; on Escape: restore original label without storage call
    - `toggleDone`: call pure function, `saveTasks`, `renderTasks`; wrap save in try/catch with error message
    - `deleteTask`: call pure function, `saveTasks`, `renderTasks`; wrap save in try/catch with error message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.3, 5.5_

- [ ] 7. Checkpoint — To-Do List
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement Links storage and pure logic in `js/logic.js`
  - [ ] 8.1 Implement `loadLinks()` and `saveLinks(links)` in `js/logic.js`
    - `loadLinks`: wrap `JSON.parse(localStorage.getItem('dashboard_links'))` in try/catch; return `[]` on any error or null
    - `saveLinks`: call `localStorage.setItem('dashboard_links', JSON.stringify(links))`; let quota errors propagate
    - Export both functions; confirm distinct key `'dashboard_links'` does not collide with `'dashboard_todos'`
    - _Requirements: 6.7, 6.8, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 8.2 Write property test for malformed JSON resilience (Property 8 — links side)
    - **Property 8: Malformed JSON returns empty collection without throwing**
    - Use `fc.string().filter(...)` for non-JSON strings set on `dashboard_links` key — assert `loadLinks()` returns `[]` without throwing, and `loadTasks()` is unaffected
    - **Validates: Requirements 8.3**

  - [ ] 8.3 Implement `normalizeUrl(input)` and `validateUrl(url)` pure functions in `js/logic.js`
    - `normalizeUrl`: if input does not match `/^https?:\/\//i`, prepend `"https://"`; return result
    - `validateUrl`: try `new URL(url)`; return `true` if no throw, `false` otherwise
    - Export both functions
    - _Requirements: 6.3, 6.4_

  - [ ]* 8.4 Write property test for URL normalisation (Property 9)
    - **Property 9: URL normalisation always produces an https:// prefix**
    - Use `fc.webUrl().map(u=>u.replace(/^https?:\/\//,''))` — assert result starts with `"https://"`
    - **Validates: Requirements 6.3**

  - [ ] 8.5 Implement `addLink(label, url, links)` and `deleteLink(id, links)` pure functions in `js/logic.js`
    - `addLink`: normalise URL, append `{id: Date.now(), label: label.trim(), url: normalizedUrl}`; return new array
    - `deleteLink`: filter out link with matching id; return new array
    - Export both functions
    - _Requirements: 6.2, 7.1_

  - [ ]* 8.6 Write property test for link addition round-trip (Property 10)
    - **Property 10: Link addition round-trip**
    - Use `fc.record({label:fc.string({minLength:1,maxLength:40}), url:fc.webUrl()})` — assert count +1, link in `loadLinks()` with correct data
    - **Validates: Requirements 6.2, 6.7, 6.8, 8.1**

  - [ ]* 8.7 Write property test for empty link rejection (Property 11)
    - **Property 11: Empty/whitespace link form rejection**
    - Use `fc.record({label:fc.constantFrom('','  '), url:fc.webUrl()})` and vice versa — assert stored count unchanged
    - **Validates: Requirements 6.5**

  - [ ]* 8.8 Write property test for link deletion (Property 12)
    - **Property 12: Link deletion reduces collection by exactly one**
    - Use `fc.array(linkArb, {minLength:1})` + random index — assert length -1, deleted link absent, others intact
    - **Validates: Requirements 7.1**

- [ ] 9. Implement `initLinks` IIFE in `js/app.js`
  - [ ] 9.1 Implement link rendering and empty-state display
    - `renderLinks()`: read from `loadLinks()`, clear `#links-grid`, render each link as `<a class="link-chip">` with favicon `<img>`, label `<span>`, and delete button
    - Set `target="_blank"` and `rel="noopener noreferrer"` on each anchor
    - Favicon: fetch `{origin}/favicon.ico`; on `onerror` hide the image element
    - Show `#links-empty` when collection is empty; hide it otherwise
    - Set `aria-label` on delete button: `"Remove {label}"`
    - _Requirements: 6.6, 6.8, 6.9, 11.5, 11.6_

  - [ ] 9.2 Implement add-link form submission with validation and error handling
    - On submit: trim label and URL; if either is empty/whitespace-only, show inline validation message indicating which field is missing (req 6.5)
    - Call `normalizeUrl`, then `validateUrl`; if invalid after normalisation show inline message (req 6.4)
    - Call `addLink` pure function, then `saveLinks`; wrap save in try/catch — on error show inline error and keep in-memory state (req 7.3, 7.4)
    - On success: clear both inputs, return focus to label input, call `renderLinks()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 7.3, 7.4_

  - [ ] 9.3 Implement link deletion with `e.preventDefault()` and error handling
    - On delete button click: call `e.preventDefault()` to prevent anchor navigation, then call `deleteLink` pure function
    - Call `saveLinks`; wrap in try/catch — on error show inline message, retain removal in panel (req 7.3, 7.4)
    - Call `renderLinks()` after deletion
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 10. Checkpoint — Quick Links
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Set up Vitest and fast-check test infrastructure
  - [ ] 11.1 Initialise `package.json` with Vitest and fast-check as dev-only dependencies
    - Run `npm init -y` and install `vitest` and `fast-check` as `devDependencies`
    - Add a `"test"` script: `"vitest --run"` for single-pass CI execution
    - Confirm `index.html` does not reference `node_modules` or any test file
    - _Requirements: 9.1, 9.5_

  - [ ] 11.2 Create `js/logic.js` as the testable pure-function module
    - Consolidate all pure functions exported across tasks 2.1, 3.1, 5.1, 5.4, 8.1, 8.3, 8.5 into a single `js/logic.js` file using ES module `export` syntax
    - Verify `js/app.js` does NOT import from `js/logic.js` (production constraint); functions are duplicated inline in each IIFE
    - _Requirements: 9.1, 9.3_

  - [ ] 11.3 Create `tests/logic.test.js` with all 12 property-based tests
    - Wire up a Map-backed `localStorage` stub in `beforeEach`/`afterEach`
    - Import all pure functions from `js/logic.js`
    - Implement property tests for Properties 1–12 using `fc.assert(fc.property(...))` with ≥ 100 iterations each
    - Tag each test with comment: `// Feature: personal-dashboard, Property {N}: {property_text}`
    - _Requirements: 3.2, 3.3, 4.2, 5.1, 5.3, 5.4, 6.2, 6.3, 6.5, 6.7, 7.1, 8.1, 8.2, 8.3_

- [ ] 12. Final checkpoint — full suite
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `js/logic.js` is test-only; it is never referenced by `index.html` or `js/app.js` in production
- Each IIFE in `js/app.js` duplicates the pure-function logic from `js/logic.js` inline — this satisfies the single-JS-file constraint (req 9.3) while still enabling isolated testing
- All 12 correctness properties from the design document are covered by property-based tests
- Checkpoints at tasks 4, 7, 10, and 12 ensure incremental validation at each widget boundary

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "11.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "5.1", "8.1", "8.3", "11.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.3", "5.4", "8.5"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.5", "5.6", "5.7", "5.8", "6.1", "8.4", "8.6", "8.7", "8.8"] },
    { "id": 4, "tasks": ["6.2", "6.3", "9.1"] },
    { "id": 5, "tasks": ["9.2", "9.3", "11.3"] }
  ]
}
```
