// ── helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

const DAY_NAMES  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function weekNum(d) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
}

// ── tasks (localStorage) ─────────────────────────────────────
const TODAY_KEY = () => {
  const d = new Date();
  return `tasks-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
};
function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TODAY_KEY())) || []; }
  catch { return []; }
}
function saveTasks(list) {
  localStorage.setItem(TODAY_KEY(), JSON.stringify(list));
}

// ── render header ────────────────────────────────────────────
function renderHeader() {
  const now  = new Date();
  const wday = now.getDay();
  $('greeting').textContent = `${greeting()}, ${CONFIG.name} ✨`;
  $('dateline').textContent =
    `${DAY_NAMES[wday]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  $('weekbadge').textContent = `Week ${weekNum(now)}`;
}

// ── render schedule timeline ──────────────────────────────────
function renderSchedule() {
  const now   = new Date();
  const wday  = now.getDay();
  const START = 7;   // 7 am
  const END   = 23;  // 11 pm
  const PX_PER_MIN = 48 / 60; // 48px per hour

  const container = $('timeline');
  container.innerHTML = '';

  // Build hour rows
  for (let h = START; h <= END; h++) {
    const row = el('div', 'timeline-hour');
    const lbl = el('span', 'hour-label');
    lbl.textContent = h === 12 ? '12 pm' : h > 12 ? `${h-12} pm` : `${h} am`;
    row.appendChild(lbl);
    container.appendChild(row);
  }

  // Place blocks
  const todayBlocks = CONFIG.blocks.filter(b => b.days.includes(wday));

  todayBlocks.forEach(b => {
    const startMin = toMinutes(b.start);
    const endMin   = toMinutes(b.end);
    const topPx    = (startMin - START * 60) * PX_PER_MIN;
    const heightPx = Math.max((endMin - startMin) * PX_PER_MIN, 24);

    const block = el('div', `time-block ${b.color}`);
    block.textContent = `${b.start} – ${b.end}  ${b.label}`;
    block.style.cssText = `top:${topPx}px; height:${heightPx}px; position:absolute; left:0; right:0;`;
    container.appendChild(block);
  });

  // Current time line
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin >= START * 60 && nowMin <= END * 60) {
    const line = el('div', 'now-line');
    line.style.cssText = `top:${(nowMin - START * 60) * PX_PER_MIN}px; position:absolute; left:0; right:0;`;
    container.appendChild(line);
  }

  container.style.position = 'relative';
  container.style.height   = `${(END - START) * 48}px`;
}

// ── render tasks ─────────────────────────────────────────────
function renderTasks() {
  let tasks = loadTasks();
  const list = $('task-list');

  function draw() {
    list.innerHTML = '';
    if (!tasks.length) {
      list.appendChild(el('li', 'empty-tasks', 'No tasks yet — add one below!'));
      return;
    }
    tasks.forEach((t, i) => {
      const li = el('li', `task-item${t.done ? ' done' : ''}`);

      const cb = document.createElement('input');
      cb.type    = 'checkbox';
      cb.checked = t.done;
      cb.addEventListener('change', () => {
        tasks[i].done = cb.checked;
        saveTasks(tasks);
        draw();
      });

      const span = el('span', '', t.text);
      const del  = el('button', 'del-btn', '×');
      del.title  = 'Remove';
      del.addEventListener('click', () => {
        tasks.splice(i, 1);
        saveTasks(tasks);
        draw();
      });

      li.append(cb, span, del);
      list.appendChild(li);
    });
  }

  draw();

  // Add task
  const input = $('task-input');
  $('task-add').addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    tasks.push({ text, done: false });
    saveTasks(tasks);
    input.value = '';
    draw();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') $('task-add').click();
  });
}

// ── render workout ────────────────────────────────────────────
function renderWorkout() {
  const wday   = new Date().getDay();
  const plan   = CONFIG.workouts[wday];
  const box    = $('workout-body');

  if (!plan) {
    box.innerHTML = `
      <div class="rest-badge">😴 Rest Day</div>
      <p class="workout-tip">Take it easy — recovery is when your muscles actually grow.
      A gentle walk with the pup counts as active recovery.</p>`;
    return;
  }

  const items = plan.exercises.map(e =>
    `<li>${e}</li>`
  ).join('');

  box.innerHTML = `
    <div class="workout-focus">💪 ${plan.focus}</div>
    <p class="workout-tip">${plan.tip}</p>
    <ul class="exercise-list">${items}</ul>`;
}

// ── render meal ───────────────────────────────────────────────
function renderMeal() {
  const wday = new Date().getDay();
  const meal = CONFIG.meals[wday];
  const isEatOut = wday === CONFIG.eatOutDay;
  const box  = $('meal-body');

  box.innerHTML = `
    <div class="${isEatOut ? 'eat-out-tag' : 'meal-tag'}">${isEatOut ? '🎉 Free day' : '🥗 Tonight'}</div>
    <div class="meal-name">${meal.name}</div>
    <p class="meal-prep">${meal.prep}</p>`;
}

// ── render weekly strip ───────────────────────────────────────
function renderWeek() {
  const now   = new Date();
  const today = now.getDay();
  const grid  = $('week-grid');
  grid.innerHTML = '';

  // find Monday of this week
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((today + 6) % 7));

  for (let i = 0; i < 7; i++) {
    const d    = new Date(mon);
    d.setDate(mon.getDate() + i);
    const dday = d.getDay();
    const isToday = dday === today && d.toDateString() === now.toDateString();

    const plan  = CONFIG.workouts[dday];
    const meal  = CONFIG.meals[dday];

    const col = el('div', `day-col${isToday ? ' today' : ''}`);

    const focusShort = plan
      ? plan.focus.split(' ').slice(0,2).join(' ')
      : 'Rest';

    const mealShort = meal
      ? (dday === CONFIG.eatOutDay ? 'Eat out 🍽️' : meal.name.split('+')[0].trim())
      : '';

    col.innerHTML = `
      <div class="day-name">${DAY_SHORT[dday]}</div>
      <div class="day-num">${d.getDate()}</div>
      <div class="day-workout ${plan ? 'active' : 'rest'}">${focusShort}</div>
      <div class="day-meal">${mealShort}</div>`;

    grid.appendChild(col);
  }
}

// ── init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderSchedule();
  renderTasks();
  renderWorkout();
  renderMeal();
  renderWeek();

  // refresh clock line every minute
  setInterval(renderSchedule, 60_000);
});
