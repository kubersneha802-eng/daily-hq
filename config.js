// ============================================================
//  DAILY HQ – CONFIG
//  Edit this file to customize your schedule, workouts & meals.
//  days: 0=Sun  1=Mon  2=Tue  3=Wed  4=Thu  5=Fri  6=Sat
// ============================================================

const CONFIG = {
  name: "Sneha",

  // ----------------------------------------------------------
  //  RECURRING TIME BLOCKS
  // ----------------------------------------------------------
  blocks: [
    { label: "Wake up + dog walk 🐾", start: "06:00", end: "06:30", days: [0,1,2,3,4,5,6], color: "amber"  },
    { label: "Shower + get ready",   start: "06:30", end: "07:00", days: [0,1,2,3,4,5,6], color: "violet" },
    { label: "Coffee + breakfast",   start: "07:00", end: "07:15", days: [0,1,2,3,4,5,6], color: "pink"   },
    { label: "Work",             start: "09:00", end: "17:00", days: [1,2,3,4,5],     color: "purple" },
    // Weekday workout (Mon, Tue, Thu, Fri — Wed & Sun are rest)
    { label: "Workout",          start: "17:30", end: "18:30", days: [1,2,4,5],       color: "green"  },
    // Weekend workout (Saturday only — Sunday is rest)
    { label: "Workout",          start: "09:00", end: "10:00", days: [6],             color: "green"  },
    // Dinner — after workout on workout days
    { label: "Cook & eat",       start: "18:45", end: "19:45", days: [1,2,4,5],       color: "pink"   },
    // Dinner — earlier on rest / weekend days
    { label: "Cook & eat",       start: "18:00", end: "19:00", days: [0,3,6],         color: "pink"   },
    // Evening dog walk — after dinner every day
    { label: "Evening dog walk", start: "19:45", end: "20:15", days: [1,2,4,5],       color: "amber"  },
    { label: "Evening dog walk", start: "19:00", end: "19:30", days: [0,3,6],         color: "amber"  },
    { label: "Wind down",        start: "21:30", end: "22:30", days: [0,1,2,3,4,5,6], color: "violet" },
  ],

  // ----------------------------------------------------------
  //  WORKOUT PLAN  (null = rest day)
  //  Targeting: weight loss + glute build + full-body tone
  // ----------------------------------------------------------
  workouts: {
    0: null, // Sunday — REST & recover
    1: {     // Monday
      focus: "Glutes & Hamstrings",
      tip:   "Focus on mind–muscle connection. Squeeze at the top of every rep.",
      exercises: [
        "Hip Thrusts — 4×12",
        "Romanian Deadlifts — 3×10",
        "Cable Glute Kickbacks — 3×15 each side",
        "Lying Hamstring Curls — 3×12",
        "Sumo Squats — 3×15",
        "Glute Bridges — 3×20",
      ]
    },
    2: {     // Tuesday
      focus: "Upper Body Push",
      tip:   "Control the eccentric (lowering) phase — it's where the sculpting happens.",
      exercises: [
        "Push-ups — 3×15",
        "Dumbbell Shoulder Press — 3×12",
        "Lateral Raises — 3×15",
        "Tricep Dips — 3×12",
        "Dumbbell Chest Press — 3×12",
        "Arnold Press — 3×10",
      ]
    },
    3: null, // Wednesday — REST & active recovery
    4: {     // Thursday
      focus: "Glutes & Quads",
      tip:   "Drive through your heel on every squat variation to fire the glutes more.",
      exercises: [
        "Bulgarian Split Squats — 3×12 each leg",
        "Leg Press — 3×15",
        "Cable Hip Abduction — 3×20 each side",
        "Walking Lunges — 3×20 steps",
        "Box Step-ups — 3×15 each",
        "Wall Sit — 3×45 sec",
      ]
    },
    5: {     // Friday
      focus: "Upper Body Pull + Core",
      tip:   "Strong back = good posture and a smaller-looking waist.",
      exercises: [
        "Lat Pulldowns — 3×12",
        "Dumbbell Rows — 3×12 each arm",
        "Bicep Curls — 3×15",
        "Face Pulls — 3×15",
        "Plank — 3×45 sec",
        "Russian Twists — 3×20",
      ]
    },
    6: {     // Saturday
      focus: "Full Body HIIT",
      tip:   "Aim for max effort during the 40-sec windows. HIIT is your fat-burn engine.",
      exercises: [
        "Jump Squats — 40 sec on / 20 sec rest",
        "Mountain Climbers — 40 sec on / 20 sec rest",
        "Burpees — 40 sec on / 20 sec rest",
        "High Knees — 40 sec on / 20 sec rest",
        "Donkey Kicks — 40 sec on / 20 sec rest",
        "× Repeat the full circuit 4 rounds",
      ]
    },
  },

  // ----------------------------------------------------------
  //  TRIPS  (multi-day travel blocks)
  //  The HQ will show a banner on trip days and auto-add
  //  pre-trip tasks on prepDate.
  // ----------------------------------------------------------
  trips: [
    {
      name:     "Philly – AKKA Program",
      hotel:    "Loews Philadelphia Hotel",
      start:    "2026-09-04",
      end:      "2026-09-06",
      color:    "purple",
      prepDate: "2026-09-02", // tasks surface 2 days before
    },
    {
      name:     "Anniversary Trip",
      hotel:    "TBD",
      start:    "2026-10-23",
      end:      "2026-10-25",
      color:    "rose",
      prepDate: "2026-10-21",
    },
  ],

  // ----------------------------------------------------------
  //  DATE-SPECIFIC TASKS  (appear once on that calendar date)
  //  Pre-trip reminders live here — add more anytime.
  // ----------------------------------------------------------
  dateTasks: {
    "2026-09-02": [
      "✅ Vacation pre-check: pack for Philly (Loews Hotel, Sept 4–6), confirm AKKA itinerary",
      "🐾 Prep dog sitter for Philly trip",
    ],
    "2026-10-21": [
      "✅ Vacation pre-check: pack for anniversary trip (Oct 23–25)",
      "🐾 Prep dog sitter for anniversary trip",
    ],
  },

  // ----------------------------------------------------------
  //  ONE-TIME EVENTS  (YYYY-MM-DD date format)
  //  Add appointments, meetings, or special evenings here.
  // ----------------------------------------------------------
  events: [
    { date: "2026-08-04", label: "Financial advisor call 📞",  start: "19:30", end: "20:00", color: "purple" },
    { date: "2026-08-03", label: "Set up apartment cameras 📷", start: "17:00", end: "17:30", color: "violet" },
    { date: "2026-08-04", label: "Meet dog babysitter 🐾",      start: "18:00", end: "18:45", color: "amber"  },
    { date: "2026-08-07", label: "Date night @ Junoon 🌹",      start: "20:30", end: "23:59", color: "rose"   },
    { date: "2026-08-08", label: "NYC Public BBQ 🎉",           start: "17:00", end: "22:00", color: "amber"  },
  ],

  // ----------------------------------------------------------
  //  WEEKLY RECURRING TASKS  (added to task list each week on that day)
  // ----------------------------------------------------------
  weeklyTasks: {
    1: [ // Every Monday
      "🛒 Order groceries for the week",
      "📋 Grocery list: paneer · spinach · bell peppers · tofu ×2 · broccoli · snap peas · ginger · tamari · sesame oil · zucchini ×3 · ricotta · cherry tomatoes · halloumi · cucumber · olives · red onion · lemon · cauliflower · olive oil · garlic · red chili flakes",
    ],
  },

  // ----------------------------------------------------------
  //  MEAL PLAN  (vegetarian · no carb · no added sugar)
  //  Change "eatOutDay" to any weekday index to move your free day.
  // ----------------------------------------------------------
  eatOutDay: 5, // Friday

  meals: {
    0: { name: "Tofu & Bell Pepper Stir-Fry",      prep: "Tofu, bell peppers & broccoli tossed in tamari, sesame oil & fresh ginger" },
    1: { name: "Paneer Bhurji + Sautéed Greens",   prep: "Scrambled paneer with spinach, bell peppers & cumin" },
    2: { name: "Tofu & Broccoli Stir-Fry",         prep: "Broccoli, snap peas & bell peppers in tamari-sesame sauce" },
    3: { name: "Zucchini Boats with Ricotta",       prep: "Hollowed zucchini stuffed with herbed ricotta & roasted cherry tomatoes" },
    4: { name: "Greek Salad + Grilled Halloumi",   prep: "Cucumber, tomato, olives, red onion, squeezed lemon" },
    5: { name: "🍽️  Eat Out! — you've earned it",   prep: "Enjoy. Pick something protein-forward if you want to stay on track." },
    6: { name: "Cauliflower Rice + Tofu & Veggies", prep: "Riced cauliflower with crispy tofu, zucchini & tamari sauce" },
  },

  // ----------------------------------------------------------
  //  WEEKLY GROCERY LIST  (shown in the Groceries section)
  // ----------------------------------------------------------
  groceries: [
    "Paneer",
    "Spinach · bell peppers · cumin",
    "Extra-firm tofu (×2 packs)",
    "Broccoli · snap peas · fresh ginger",
    "Tamari sauce · sesame oil",
    "Zucchini ×3 · ricotta · cherry tomatoes · fresh herbs",
    "Halloumi · cucumber · kalamata olives · red onion · lemon",
    "Cauliflower (1 head)",
    "Staples: olive oil · garlic · red chili flakes",
    "Cottonelle wipes",
    "Pepper jack cheese",
  ],
};
