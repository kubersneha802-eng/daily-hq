// ── helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Convert "HH:MM" → "h:mm am/pm"
function to12h(t) {
  let [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
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

// ── date helpers ──────────────────────────────────────────────
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── Apple Calendar fetch ──────────────────────────────────────
async function loadCalendarEvents() {
  try {
    const res = await fetch('data/calendar.json?t=' + Date.now());
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch { return []; }
}
function calEventsForToday(events) {
  const today = todayISO();
  return events.filter(e => e.start.slice(0, 10) === today);
}

// ── trip helpers ─────────────────────────────────────────────
function tripForDate(iso) {
  return (CONFIG.trips || []).find(t => iso >= t.start && iso <= t.end) || null;
}

// ── date-specific tasks ───────────────────────────────────────
function initDateTasks() {
  const today = todayISO();
  const toAdd = CONFIG.dateTasks?.[today];
  if (!toAdd?.length) return;
  const key = `date-tasks-added-${today}`;
  if (localStorage.getItem(key)) return;
  let tasks = loadTasks();
  toAdd.slice().reverse().forEach(text => {
    if (!tasks.find(t => t.text === text)) tasks.unshift({ text, done: false });
  });
  saveTasks(tasks);
  localStorage.setItem(key, '1');
}

// ── weekly tasks auto-inject ──────────────────────────────────
function initWeeklyTasks() {
  const now  = new Date();
  const wday = now.getDay();
  const weekly = CONFIG.weeklyTasks?.[wday];
  if (!weekly?.length) return;
  const weekKey = `weekly-added-${weekNum(now)}-${wday}`;
  if (localStorage.getItem(weekKey)) return;
  let tasks = loadTasks();
  weekly.slice().reverse().forEach(text => {
    if (!tasks.find(t => t.text === text)) tasks.unshift({ text, done: false });
  });
  saveTasks(tasks);
  localStorage.setItem(weekKey, '1');
}

// ── render header ─────────────────────────────────────────────
function renderHeader() {
  const now  = new Date();
  const wday = now.getDay();
  $('greeting').textContent = `${greeting()}, ${CONFIG.name} ✨`;
  $('dateline').textContent =
    `${DAY_NAMES[wday]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  $('weekbadge').textContent = `Week ${weekNum(now)}`;
}

// ── trip banner ───────────────────────────────────────────────
function renderTripBanner() {
  const today = todayISO();
  const trip  = tripForDate(today);
  const banner = $('trip-banner');
  if (!trip) { banner.style.display = 'none'; return; }
  const isFirst = today === trip.start;
  const isLast  = today === trip.end;
  const phase   = isFirst ? '✈️ Departing today' : isLast ? '🏡 Heading home today' : '📍 Currently away';
  const hotelLine = trip.hotel !== 'TBD' ? ` &nbsp;·&nbsp; 🏨 ${trip.hotel}` : '';
  banner.style.display = 'block';
  banner.className = `trip-banner trip-${trip.color}`;
  banner.innerHTML = `<strong>${phase} — ${trip.name}</strong>${hotelLine}`;
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
      cb.addEventListener('change', () => { tasks[i].done = cb.checked; saveTasks(tasks); draw(); });
      const span = el('span', '', t.text);
      const del  = el('button', 'del-btn', '×');
      del.title  = 'Remove';
      del.addEventListener('click', () => { tasks.splice(i, 1); saveTasks(tasks); draw(); });
      li.append(cb, span, del);
      list.appendChild(li);
    });
  }
  draw();

  const input = $('task-input');
  $('task-add').addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    tasks.push({ text, done: false });
    saveTasks(tasks);
    input.value = '';
    draw();
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') $('task-add').click(); });
}

// ── render workout ────────────────────────────────────────────
function renderWorkout() {
  const wday     = new Date().getDay();
  const override = CONFIG.workoutOverrides?.[todayISO()];
  const plan     = override || CONFIG.workouts[wday];
  const box      = $('workout-body');
  if (!plan) {
    box.innerHTML = `<div class="rest-badge">😴 Rest Day</div>
      <p class="workout-tip">Recovery is when your muscles actually grow. A long walk with the pup counts.</p>`;
    return;
  }
  const badge = override
    ? `<div class="rest-badge">🚶‍♀️ ${plan.focus}</div>`
    : `<div class="workout-focus">💪 ${plan.focus}</div>`;
  box.innerHTML = `
    ${badge}
    <p class="workout-tip">${plan.tip}</p>
    <ul class="exercise-list">${plan.exercises.map(e => `<li>${e}</li>`).join('')}</ul>`;
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

// ── render groceries ─────────────────────────────────────────
function renderGroceries() {
  const box = $('groceries-body');
  const list = (CONFIG.groceries || []);
  if (!list.length) { box.innerHTML = '<p class="meal-prep">No grocery list in config.</p>'; return; }
  box.innerHTML = `<ul class="grocery-list">${list.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

// ── render weekly strip ───────────────────────────────────────
function renderWeek() {
  const now   = new Date();
  const today = now.getDay();
  const grid  = $('week-grid');
  grid.innerHTML = '';
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((today + 6) % 7));

  for (let i = 0; i < 7; i++) {
    const d    = new Date(mon);
    d.setDate(mon.getDate() + i);
    const dday = d.getDay();
    const isToday = dday === today && d.toDateString() === now.toDateString();
    const dISO = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const trip = tripForDate(dISO);
    const plan = CONFIG.workouts[dday];
    const meal = CONFIG.meals[dday];

    const col = el('div', `day-col${isToday ? ' today' : ''}${trip ? ' trip-day' : ''}`);
    const override   = CONFIG.workoutOverrides?.[dISO];
    const focusShort = trip    ? '✈️ Away'
                     : override ? '🚶‍♀️ Walking'
                     : plan     ? plan.focus.split(' ').slice(0,2).join(' ')
                     : 'Rest';
    const mealShort  = trip
      ? trip.name.split('–')[0].trim()
      : meal ? (dday === CONFIG.eatOutDay ? 'Eat out 🍽️' : meal.name.split('+')[0].trim()) : '';

    col.innerHTML = `
      <div class="day-name">${DAY_SHORT[dday]}</div>
      <div class="day-num">${d.getDate()}</div>
      <div class="day-workout ${trip ? 'away' : (override || plan) ? 'active' : 'rest'}">${focusShort}</div>
      <div class="day-meal">${mealShort}</div>`;
    grid.appendChild(col);
  }
}

// ── full week calendar ────────────────────────────────────────
function renderWeekCal() {
  const now    = new Date();
  const today  = now.getDay();
  const START  = 7;
  const END    = 23;
  const PX_HR  = 40;
  const PX_MIN = PX_HR / 60;
  const H      = (END - START) * PX_HR;

  const container = $('week-cal');
  container.innerHTML = '';

  // Monday of this week
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((today + 6) % 7));

  // ── Day header row ──
  const hdr = el('div', 'wcal-header');
  hdr.appendChild(el('div', 'wcal-time-spacer'));          // blank corner
  for (let i = 0; i < 7; i++) {
    const d    = new Date(mon); d.setDate(mon.getDate() + i);
    const dday = d.getDay();
    const isToday = d.toDateString() === now.toDateString();
    const dISO = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const trip = tripForDate(dISO);
    const cell = el('div', `wcal-day-hdr${isToday ? ' wcal-today-hdr' : ''}${trip ? ' wcal-trip-hdr' : ''}`);
    cell.innerHTML = `<span class="wcal-day-name">${DAY_SHORT[dday]}</span>
                      <span class="wcal-day-num">${d.getDate()}</span>`;
    hdr.appendChild(cell);
  }
  container.appendChild(hdr);

  // ── Body: time column + 7 day columns ──
  const body = el('div', 'wcal-body');

  // Time labels column
  const timeCol = el('div', 'wcal-times');
  for (let h = START; h <= END; h++) {
    const lbl = el('div', 'wcal-tlabel');
    lbl.style.height = `${PX_HR}px`;
    lbl.textContent  = h === 12 ? '12 pm' : h > 12 ? `${h-12} pm` : `${h} am`;
    timeCol.appendChild(lbl);
  }
  body.appendChild(timeCol);

  // Day columns
  for (let i = 0; i < 7; i++) {
    const d    = new Date(mon); d.setDate(mon.getDate() + i);
    const dday = d.getDay();
    const isToday = d.toDateString() === now.toDateString();
    const dISO = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const trip = tripForDate(dISO);

    const col = el('div', `wcal-col${isToday ? ' wcal-col-today' : ''}`);
    col.style.height = `${H}px`;

    // Grid lines (one per hour)
    for (let h = START; h < END; h++) {
      const line = el('div', 'wcal-grid-line');
      line.style.top = `${(h - START) * PX_HR}px`;
      col.appendChild(line);
    }

    if (trip) {
      // Show trip overlay instead of blocks
      const tripBlock = el('div', 'wcal-trip-block');
      tripBlock.textContent = `✈️ ${trip.name.split('–')[0].trim()}`;
      col.appendChild(tripBlock);
    } else {
      const dayBlocks = CONFIG.blocks.filter(b => b.days.includes(dday));
      const dayEvents = (CONFIG.events || []).filter(e => e.date === dISO);

      [...dayBlocks, ...dayEvents].forEach(b => {
        const sm       = toMinutes(b.start);
        const em       = toMinutes(b.end);
        if (sm >= END * 60 || em <= START * 60) return;   // completely outside window
        const clampEm  = Math.min(em, END * 60);
        const topPx    = (sm - START * 60) * PX_MIN;
        const hPx      = Math.max((clampEm - sm) * PX_MIN, 18);

        const block = el('div', `wcal-block ${b.color}`);
        block.style.top    = `${topPx}px`;
        block.style.height = `${hPx}px`;
        block.title        = `${to12h(b.start)} – ${to12h(b.end)}  ${b.label}`;
        block.textContent  = b.label;
        col.appendChild(block);
      });
    }

    // Now line on today
    if (isToday) {
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= START * 60 && nowMin <= END * 60) {
        const line = el('div', 'wcal-now-line');
        line.style.top = `${(nowMin - START * 60) * PX_MIN}px`;
        col.appendChild(line);
      }
    }

    body.appendChild(col);
  }

  container.appendChild(body);
}

// ── horizontal time blocking ──────────────────────────────────
function renderSchedule(calEvents = []) {
  const now   = new Date();
  const wday  = now.getDay();
  const START = 7;    // 7 am
  const END   = 23;   // 11 pm
  const TOTAL = (END - START) * 60;

  const container = $('timeline');
  container.innerHTML = '';

  // ── Hour header row ──
  const hourRow = el('div', 'h-hours');
  for (let h = START; h <= END; h++) {
    const lbl = el('div', 'h-hour');
    lbl.textContent = h === 12 ? '12 pm' : h > 12 ? `${h-12} pm` : `${h} am`;
    hourRow.appendChild(lbl);
  }
  container.appendChild(hourRow);

  // ── All-day chips ──
  const allDayBox = $('all-day-events');
  allDayBox.innerHTML = '';
  calEvents.filter(e => e.allDay).forEach(e => {
    allDayBox.appendChild(el('span', 'all-day-chip', `📅 ${e.title}`));
  });

  // ── Build block list ──
  const todayStr    = todayISO();
  const configEvts  = (CONFIG.events || []).filter(e => e.date === todayStr);
  const calTimed    = calEvents.filter(e => !e.allDay).map(e => {
    const s = new Date(e.start), x = new Date(e.end);
    return {
      label: e.title + (e.location ? ` · ${e.location}` : ''),
      start: `${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}`,
      end:   `${String(x.getHours()).padStart(2,'0')}:${String(x.getMinutes()).padStart(2,'0')}`,
      color: 'cal', row: 1,
    };
  });

  const recurring = CONFIG.blocks.filter(b => b.days.includes(wday)).map(b => ({ ...b, row: 0 }));
  const oneOff    = configEvts.map(b => ({ ...b, row: 1 }));

  const allBlocks = [...recurring, ...oneOff, ...calTimed].filter(b => {
    const sm = toMinutes(b.start);
    const em = toMinutes(b.end);
    return sm < END * 60 && em > START * 60 && em > sm;
  });

  // ── Row areas ──
  const rowArea0 = el('div', 'h-row');
  const rowArea1 = el('div', 'h-row');

  allBlocks.forEach(b => {
    const sm      = toMinutes(b.start);
    const em      = toMinutes(b.end);
    const clampEm = Math.min(em, END * 60);
    const lft     = ((sm - START * 60) / TOTAL * 100).toFixed(4);
    const wid     = ((clampEm - sm) / TOTAL * 100).toFixed(4);

    const block = el('div', `h-block ${b.color}`);
    block.style.left  = `${lft}%`;
    block.style.width = `${wid}%`;
    block.title = `${to12h(b.start)} – ${to12h(b.end)}  ${b.label}`;
    block.innerHTML = `<span class="h-block-time">${to12h(b.start)}</span> ${b.label}`;

    (b.row === 1 ? rowArea1 : rowArea0).appendChild(block);
  });

  // ── Current time line (on both rows) ──
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin >= START * 60 && nowMin <= END * 60) {
    const pct = ((nowMin - START * 60) / TOTAL * 100).toFixed(4);
    [rowArea0, rowArea1].forEach(area => {
      const line = el('div', 'h-now-line');
      line.style.left = `${pct}%`;
      area.appendChild(line);
    });
  }

  container.appendChild(rowArea0);
  if (rowArea1.children.length > 1) container.appendChild(rowArea1); // >1 because of now-line
}

// ── init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  renderHeader();
  renderTripBanner();

  let calEvents = await loadCalendarEvents();
  const todayCal = () => calEventsForToday(calEvents);

  initDateTasks();
  initWeeklyTasks();
  renderTasks();
  renderWorkout();
  renderMeal();
  renderGroceries();
  renderWeek();
  renderWeekCal();
  renderSchedule(todayCal());

  setInterval(() => renderSchedule(todayCal()), 60_000);
  setInterval(async () => {
    calEvents = await loadCalendarEvents();
    renderSchedule(todayCal());
  }, 60 * 60_000);
});
