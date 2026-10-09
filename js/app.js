/* ================================================
   MY DASHBOARD — app.js
   Vanilla JS | LocalStorage | No frameworks
   ================================================ */

'use strict';

/* ────────────────────────────────────────────────
   SETTINGS
   Persisted preferences: theme, name, timer duration
   ──────────────────────────────────────────────── */
const Settings = (function () {
  const KEY = 'dashboard_settings';

  const defaults = {
    theme:         'dark',   // 'light' | 'dark'
    name:          '',       // custom name, empty = no name
    timerMinutes:  25,       // 1–120
  };

  function load() {
    try {
      return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY)));
    } catch {
      return Object.assign({}, defaults);
    }
  }

  function save(patch) {
    const current = load();
    const updated = Object.assign(current, patch);
    try {
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch { /* quota — silent */ }
    return updated;
  }

  return { load, save };
})();


/* ────────────────────────────────────────────────
   THEME TOGGLE  🌙 / ☀️
   ──────────────────────────────────────────────── */
(function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    btn.textContent  = theme === 'dark' ? '🌙' : '☀️';
    btn.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  // Boot from saved preference
  apply(Settings.load().theme);

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    Settings.save({ theme: next });
  });
})();


/* ────────────────────────────────────────────────
   GREETING & CLOCK
   ──────────────────────────────────────────────── */
(function initGreeting() {
  const greetingEl  = document.getElementById('greeting-text');
  const datetimeEl  = document.getElementById('datetime-text');
  const nameEditBtn = document.getElementById('name-edit-btn');
  const nameEditRow = document.getElementById('name-edit-row');
  const nameInput   = document.getElementById('name-input');
  const nameSaveBtn = document.getElementById('name-save');
  const nameCancelBtn = document.getElementById('name-cancel');

  function getGreeting(hour) {
    if (hour >= 5  && hour < 12) return 'Good morning ☀️';
    if (hour >= 12 && hour < 17) return 'Good afternoon 🌤️';
    if (hour >= 17 && hour < 21) return 'Good evening 🌆';
    return 'Good night 🌙';
  }

  function buildGreetingText(hour, name) {
    const base = getGreeting(hour);
    // Append name if one is saved, strip trailing emoji for cleaner join
    if (name) {
      const withoutEmoji = base.replace(/\s[\u{1F300}-\u{1FAFF}]$/u, '');
      return `${withoutEmoji}, ${name}! ${base.match(/[\u{1F300}-\u{1FAFF}]$/u)?.[0] ?? ''}`.trim();
    }
    return base;
  }

  function update() {
    const now  = new Date();
    const hour = now.getHours();
    const { name } = Settings.load();

    greetingEl.textContent = buildGreetingText(hour, name);

    const dateStr = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
    });

    const timeStr = now.toLocaleTimeString(undefined, {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    datetimeEl.textContent = `${dateStr} · ${timeStr}`;
  }

  // ── Name editing ──
  function showEditor() {
    nameInput.value = Settings.load().name;
    nameEditRow.style.display = 'flex';
    nameEditBtn.style.display = 'none';
    nameInput.focus();
    nameInput.select();
  }

  function hideEditor() {
    nameEditRow.style.display = 'none';
    nameEditBtn.style.display = '';
  }

  function saveName() {
    const name = nameInput.value.trim();
    Settings.save({ name });
    hideEditor();
    update(); // refresh greeting immediately
  }

  nameEditBtn.addEventListener('click', showEditor);

  nameSaveBtn.addEventListener('click', saveName);

  nameCancelBtn.addEventListener('click', hideEditor);

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); saveName(); }
    if (e.key === 'Escape') hideEditor();
  });

  update();
  setInterval(update, 1000);
})();


/* ────────────────────────────────────────────────
   FOCUS TIMER
   ──────────────────────────────────────────────── */
(function initTimer() {
  const displayEl   = document.getElementById('timer-display');
  const startBtn    = document.getElementById('timer-start');
  const stopBtn     = document.getElementById('timer-stop');
  const resetBtn    = document.getElementById('timer-reset');
  const card        = document.getElementById('timer-card');
  const settingEl   = document.getElementById('timer-setting');
  const durationInput = document.getElementById('timer-duration');
  const setBtn      = document.getElementById('timer-set');

  // Load persisted duration (minutes → seconds)
  let totalSeconds = (Settings.load().timerMinutes || 25) * 60;
  let remaining    = totalSeconds;
  let intervalId   = null;

  // Keep duration input in sync with saved value
  durationInput.value = totalSeconds / 60;

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function render() {
    displayEl.textContent = formatTime(remaining);
  }

  function setIdleState() {
    card.classList.remove('running', 'paused');
    startBtn.disabled = false;
    stopBtn.disabled  = true;
    settingEl.style.display = '';
  }

  function setRunningState() {
    card.classList.add('running');
    card.classList.remove('paused');
    startBtn.disabled = true;
    stopBtn.disabled  = false;
    settingEl.style.display = 'none';
  }

  function setPausedState() {
    card.classList.remove('running');
    card.classList.add('paused');
    startBtn.disabled = false;
    stopBtn.disabled  = true;
    settingEl.style.display = 'none';
  }

  function tick() {
    if (remaining <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      setIdleState();
      displayEl.textContent = 'Done! 🎉';
      return;
    }
    remaining--;
    render();
  }

  function start() {
    if (intervalId) return;
    setRunningState();
    intervalId = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
    setPausedState();
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    remaining  = totalSeconds;
    setIdleState();
    render();
  }

  // ── Duration setting ──
  function applyDuration() {
    let mins = parseInt(durationInput.value, 10);
    if (isNaN(mins) || mins < 1)   mins = 1;
    if (mins > 120)                mins = 120;
    durationInput.value = mins;

    totalSeconds = mins * 60;
    remaining    = totalSeconds;
    Settings.save({ timerMinutes: mins });
    render();
  }

  setBtn.addEventListener('click', applyDuration);

  durationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); applyDuration(); }
  });

  // Initial state
  stopBtn.disabled = true;
  render();

  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click',  stop);
  resetBtn.addEventListener('click', reset);
})();


/* ────────────────────────────────────────────────
   TO-DO LIST
   ──────────────────────────────────────────────── */
(function initTodo() {
  const STORAGE_KEY = 'dashboard_todos';

  const form         = document.getElementById('todo-form');
  const input        = document.getElementById('todo-input');
  const listEl       = document.getElementById('todo-list');
  const emptyEl      = document.getElementById('todo-empty');
  const sortSelect   = document.getElementById('todo-sort');
  const dupMsgEl     = document.getElementById('todo-duplicate-msg');

  // ── Storage ──────────────────────────────────
  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  // ── Sort ─────────────────────────────────────
  // Persist the chosen sort order in Settings
  const SORT_KEY = 'todoSort';

  function getSortOrder() {
    return Settings.load()[SORT_KEY] || 'added';
  }

  function applySortOrder(tasks, order) {
    const copy = [...tasks]; // never mutate stored order
    switch (order) {
      case 'az':
        return copy.sort((a, b) =>
          a.text.localeCompare(b.text, undefined, { sensitivity: 'base' })
        );
      case 'za':
        return copy.sort((a, b) =>
          b.text.localeCompare(a.text, undefined, { sensitivity: 'base' })
        );
      case 'pending':
        // pending (done=false) first, then done; within each group keep insertion order
        return copy.sort((a, b) => Number(a.done) - Number(b.done));
      case 'done':
        return copy.sort((a, b) => Number(b.done) - Number(a.done));
      default: // 'added' — insertion order preserved via id ascending
        return copy.sort((a, b) => a.id - b.id);
    }
  }

  // ── Duplicate detection ───────────────────────
  function isDuplicate(text, excludeId = null) {
    const normalised = text.trim().toLowerCase();
    return loadTasks().some(
      (t) => t.id !== excludeId && t.text.toLowerCase() === normalised
    );
  }

  function showDuplicateWarning() {
    dupMsgEl.style.display = 'block';
    // Auto-hide after 3 s
    clearTimeout(showDuplicateWarning._timer);
    showDuplicateWarning._timer = setTimeout(() => {
      dupMsgEl.style.display = 'none';
    }, 3000);
  }

  // ── Render ────────────────────────────────────
  function renderTasks() {
    const raw    = loadTasks();
    const order  = getSortOrder();
    const tasks  = applySortOrder(raw, order);

    listEl.innerHTML = '';
    emptyEl.style.display = raw.length === 0 ? 'block' : 'none';
    tasks.forEach((task) => listEl.appendChild(createTaskEl(task)));
  }

  function createTaskEl(task) {
    const li = document.createElement('li');
    li.className  = `todo-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Mark task complete');
    checkbox.addEventListener('change', () => toggleDone(task.id));

    const textSpan = document.createElement('span');
    textSpan.className   = 'task-text';
    textSpan.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.addEventListener('click', () => startEdit(task.id, li, textSpan));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn danger';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(actions);
    return li;
  }

  // ── CRUD ──────────────────────────────────────
  function addTask(text) {
    if (isDuplicate(text)) {
      showDuplicateWarning();
      return;
    }
    const tasks = loadTasks();
    tasks.push({ id: Date.now(), text: text.trim(), done: false });
    saveTasks(tasks);
    renderTasks();
  }

  function toggleDone(id) {
    saveTasks(
      loadTasks().map((t) => t.id === id ? { ...t, done: !t.done } : t)
    );
    renderTasks();
  }

  function deleteTask(id) {
    saveTasks(loadTasks().filter((t) => t.id !== id));
    renderTasks();
  }

  function startEdit(id, li, textSpan) {
    const currentText = textSpan.textContent;

    const editInput = document.createElement('input');
    editInput.type      = 'text';
    editInput.className = 'edit-input';
    editInput.value     = currentText;
    editInput.maxLength = 120;
    li.replaceChild(editInput, textSpan);
    editInput.focus();
    editInput.select();

    function commitEdit() {
      const newText = editInput.value.trim();
      if (!newText || newText === currentText) {
        renderTasks();
        return;
      }
      // Check for duplicate against other tasks (exclude current id)
      if (isDuplicate(newText, id)) {
        showDuplicateWarning();
        renderTasks();
        return;
      }
      saveTasks(
        loadTasks().map((t) => t.id === id ? { ...t, text: newText } : t)
      );
      renderTasks();
    }

    editInput.addEventListener('blur', commitEdit);
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); }
      if (e.key === 'Escape') renderTasks();
    });
  }

  // ── Event listeners ───────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTask(text);
    // Only clear & refocus when task was actually added (no duplicate)
    if (dupMsgEl.style.display === 'none') {
      input.value = '';
    }
    input.focus();
  });

  sortSelect.addEventListener('change', () => {
    Settings.save({ [SORT_KEY]: sortSelect.value });
    renderTasks();
  });

  // ── Boot ──────────────────────────────────────
  // Restore saved sort selection
  sortSelect.value = getSortOrder();
  renderTasks();
})();


/* ────────────────────────────────────────────────
   QUICK LINKS
   ──────────────────────────────────────────────── */
(function initLinks() {
  const STORAGE_KEY = 'dashboard_links';

  const form      = document.getElementById('link-form');
  const nameInput = document.getElementById('link-name');
  const urlInput  = document.getElementById('link-url');
  const gridEl    = document.getElementById('links-grid');
  const emptyEl   = document.getElementById('links-empty');

  function loadLinks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveLinks(links) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  function faviconUrl(href) {
    try {
      const { origin } = new URL(href);
      return `${origin}/favicon.ico`;
    } catch {
      return '';
    }
  }

  function renderLinks() {
    const links = loadLinks();
    gridEl.innerHTML = '';
    emptyEl.style.display = links.length === 0 ? 'block' : 'none';

    links.forEach((link) => {
      const chip = document.createElement('a');
      chip.className = 'link-chip';
      chip.href      = link.url;
      chip.target    = '_blank';
      chip.rel       = 'noopener noreferrer';

      const favicon = document.createElement('img');
      favicon.className = 'chip-favicon';
      favicon.src       = faviconUrl(link.url);
      favicon.alt       = '';
      favicon.onerror   = () => { favicon.style.display = 'none'; };

      const label = document.createElement('span');
      label.textContent = link.label;

      const delBtn = document.createElement('button');
      delBtn.className = 'chip-delete';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', `Remove ${link.label}`);
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        deleteLink(link.id);
      });

      chip.appendChild(favicon);
      chip.appendChild(label);
      chip.appendChild(delBtn);
      gridEl.appendChild(chip);
    });
  }

  function addLink(label, url) {
    let href = url.trim();
    if (!/^https?:\/\//i.test(href)) href = 'https://' + href;
    const links = loadLinks();
    links.push({ id: Date.now(), label: label.trim(), url: href });
    saveLinks(links);
    renderLinks();
  }

  function deleteLink(id) {
    saveLinks(loadLinks().filter((l) => l.id !== id));
    renderLinks();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const label = nameInput.value.trim();
    const url   = urlInput.value.trim();
    if (!label || !url) return;
    addLink(label, url);
    nameInput.value = '';
    urlInput.value  = '';
    nameInput.focus();
  });

  renderLinks();
})();
