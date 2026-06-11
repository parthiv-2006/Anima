# Anima

A habit tracker that turns daily consistency into a visible, evolving creature — three species, nine potential evolution paths, and a decay system that punishes inactivity.

[![CI](https://github.com/parthiv-2006/Anima/actions/workflows/ci.yml/badge.svg)](https://github.com/parthiv-2006/Anima/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-anima--client.vercel.app-amber?style=flat)](https://anima-client.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=flat)](LICENSE)

<!-- Hero screenshot — replace placeholder after running scripts/capture-screenshots.mjs -->
![Anima dashboard showing the pet habitat panel and quest cards](.github/assets/screenshots/dashboard-desktop.png)

---

## What It Is

Most habit trackers offer streaks and checkboxes. Anima adds stakes: every completed habit awards stat points across three categories (Strength, Intellect, Spirit) that accumulate on a pet creature, which evolves at 100 XP and again at 500 XP. The final form depends on which stat dominates and whether the build is "pure" (dominant stat at least 2× the lowest) or "hybrid." Miss a day without freeze streak protection and the pet loses 10% HP. The evolution system is entirely deterministic — the formula runs on every XP mutation, so a habit undo can push a pet back to a previous stage.

---

## Demo

[![Live Demo](https://img.shields.io/badge/Try%20It%20Live-anima--client.vercel.app-amber?style=for-the-badge)](https://anima-client.vercel.app)

![Anima demo — dashboard, quest completion, evolution event, focus timer, insights, and ambient mode](.github/assets/demo.gif)

---

## Screenshots

Capture all screenshots by running `node scripts/capture-screenshots.mjs` (see the script for setup). Screenshots are stored in `.github/assets/screenshots/` and follow the user journey below.

### Login and Registration
![Login page with email/password form and species pre-selection for new accounts](.github/assets/screenshots/auth-login.png)
The authentication form handles login and registration in a single view. New accounts include species selection (Ember, Aqua, Terra) passed in the `POST /api/auth/register` payload so the pet species is fixed at account creation.

### Main Dashboard (Desktop, 1440×900)
![Three-panel dashboard: icon sidebar, pet habitat with HP/XP bars, scrollable quest list](.github/assets/screenshots/dashboard-desktop.png)
The 60 px icon sidebar holds navigation and a level badge calculated as `floor(totalXp / 100) + 1`. The 380 px habitat panel shows the pet sprite, HP and XP bars, and a speech bubble that surfaces stat-contextual dialogue. The quest panel lists habits grouped by completion status.

### Main Dashboard (Mobile, 390×844)
![Responsive mobile layout of the main dashboard](.github/assets/screenshots/dashboard-mobile.png)
The layout collapses for narrow viewports, keeping the pet habitat and quest list accessible without horizontal scrolling.

### Quest Card Completion
![Quest card with confetti particles and a floating +XP label mid-animation](.github/assets/screenshots/quest-complete.png)
Clicking a quest card triggers an optimistic UI update (the card flips to completed immediately), a `canvas-confetti` particle burst (dynamically imported), and a Framer Motion floating "+XP" label — all before the API response returns. On failure the card reverts.

### Evolution Event
![Cinematic modal showing the creature transforming with expanding amber rings](.github/assets/screenshots/evolution-event.png)
When `totalXp` crosses 100 or 500, the `EvolutionEvent` modal fires a three-phase cinematic: the previous form pulses in grayscale during the charge phase (900 ms), expanding amber rings animate outward, then the new form scales in with `backOut` spring easing and a sound effect (2200 ms).

### Focus Timer
![Circular Pomodoro-style progress ring with preset duration buttons](.github/assets/screenshots/focus-timer.png)
Preset durations from 5 to 60 minutes with INT or SPI stat selection. Session state (`targetEndTime`, `selectedStat`, `isPaused`) persists to `localStorage` so an active session survives page refreshes. On completion, the client creates a temporary habit, marks it complete to award XP, and deletes it — routing focus XP through the same `calculateEvolution()` pipeline as regular habits.

### Insights View
![Weekly bar chart and GitHub-style productivity heatmap side by side](.github/assets/screenshots/insights.png)
The heatmap calls `GET /api/habits/history`, which aggregates per-day completion counts server-side from each habit's `completionLog` subdocument array. Local-date key extraction (`getLocalDateKey`) avoids UTC-to-local timezone drift in the calendar display.

### Adventure Log
![Chronological list of all completion events with stat badges and XP amounts](.github/assets/screenshots/adventure-log.png)
A flat, newest-first view of every completion across all habits. Each entry shows habit name, stat category, XP awarded, difficulty (1-3 stars), and the optional note entered at completion time.

### Item Shop
![Shop modal with consumables and themed backgrounds, coin prices, and owned status](.github/assets/screenshots/shop.png)
Coins earned per completion (`5 × difficulty + min(streak, 7)`) buy health potions (+25 HP or full restore), freeze streak protection (24-hour window), or six themed environment backgrounds priced at 200-300 coins each.

### Settings
![Settings panel with password change form and avatar emoji selection](.github/assets/screenshots/settings.png)
Authenticated password change via `PUT /api/auth/update-password` (requires current password verification) and avatar selection across eight options stored as a string enum on the User model.

### Ambient Mode
![Full-screen overlay with the animated pet and a wellness thought bubble](.github/assets/screenshots/ambient-mode.png)
A distraction-free full-screen view of the pet. Wellness reminders surface as thought bubbles: the first at 30 seconds, then every 20 to 40 minutes with a randomized delay to prevent habituation. The pet continues its weighted idle animation cycle in this mode.

---

## Features

- **Stat-driven evolution** — 9 possible final forms across 3 species × 3 dominant-stat paths; stage 3 branches into pure (dominant stat ≥ 2× minimum via `max >= 2 * min`) or hybrid, computed by `calculateEvolution()` on every XP change including habit undos
- **Quest cards with optimistic UI** — habit state flips to "completed" locally before the API call returns, then reverts on failure; `canvas-confetti` is dynamically imported so the 14 KB library is excluded from the initial bundle
- **HP decay** — `POST /api/pet/decay` checks hours elapsed since `lastLogin`; if over 24, multiplies current HP by 0.9 (rounded, clamped to 0) and resets `isCompletedToday` on all habits
- **Daily streak middleware** — `dailyReset` runs on every habit route; crossing a UTC midnight boundary breaks streaks for habits not completed the previous day, unless `freezeProtectionUntil` has not expired
- **Focus timer with XP integration** — Pomodoro countdown persists session state to `localStorage` with a `targetEndTime` timestamp; on completion, creates and deletes a temporary habit to route XP through `calculateEvolution()`; difficulty scales as `ceil(duration / 20)` capped at 3
- **Item shop** — three consumable types (health potion, super health potion, freeze streak) and six purchasable themed backgrounds stored in an embedded `Inventory` subdocument on the User model
- **Streak coin economy** — coins per completion: `5 × difficulty + min(streak, 7)`; all shop purchases deduct from this balance with an atomic coin-check before purchase
- **Adventure log** — flat aggregation of all `completionLog` subdocument entries across habits, sorted newest-first by completion date
- **Productivity heatmap** — per-day aggregation computed server-side; each day bucket tracks `totalXp`, `strXp`, `intXp`, `spiXp`, and per-category habit counts; initialized from account creation date to today so empty days appear correctly
- **AI pet companion chat** — species-specific personality (EMBER=fiery warrior mentor, AQUA=calm sage, TERRA=grounded nurturer) with live stat context injected into every Groq prompt; session history maintains multi-turn coherence
- **AI-generated adventure log narration** — on log open, Groq `llama-3.1-8b-instant` generates a 2-sentence fantasy-RPG paragraph per completion; stored in React component state only, regenerated on demand
- **Rule-based habit recommendations** — identifies the two weakest stats and returns 3 prioritized suggestions with explanations; no LLM dependency
- **Ambient mode** — full-screen pet view with staggered wellness thought bubbles at random 20-40 minute intervals after an initial 30-second delay
- **Seven themed environments** — gradient overlays keyed to Tailwind design tokens, with a location badge in the habitat when a non-default background is active

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend framework | React 18 + Vite 5 | Pure SPA with no server-rendered routes; Vite's ESM-native dev server eliminates webpack cold-start overhead, and per-chunk builds with dynamic imports keep the initial bundle tight |
| Styling | Tailwind CSS 3 | Utility classes map directly to a custom design token set (8 semantic color tokens, 4 glow box-shadows) defined in `tailwind.config.js`; no runtime CSS-in-JS cost |
| UI animation | Framer Motion 11 | `AnimatePresence` handles mount/unmount transitions the CSS `transition` property cannot express; spring physics drives the evolution modal shake and navbar hover states |
| Pet animation | Framer Motion 11 | The idle pet cycles through 5 states (idle 40%, bounce 20%, sleep 15%, wiggle 15%, float 10%) via a weighted random selector; each state maps to a distinct Framer keyframe array |
| Evolution cinematics | lottie-react 2 | JSON Lottie animations bundled at build time provide vector-quality rendering for the Ember species across all 3 stages; no SVG/CSS animation could match the fidelity at this file size |
| State management | Zustand 4 + persist middleware | Auth token and user object survive page refreshes via `localStorage` hydration; the `isHydrated` flag prevents a flash of the unauthenticated login screen before the store rehydrates |
| Particle effects | canvas-confetti 1.9 | Dynamically imported on first quest completion so it is absent from the initial chunk; per-stat color palettes distinguish STR (amber), INT (blue), and SPI (green) completions visually |
| Charts | Recharts 2 | Declarative SVG radar chart for the STR/INT/SPI triangle and bar charts for the weekly breakdown; no canvas dependency, compatible with React's reconciler |
| Backend | Express 4 + Node.js | Thin REST API; four route groups (auth, pet, habits, shop) do not justify a more opinionated framework |
| Database ODM | Mongoose 8 | Embedded subdocuments for Pet, Habits, and Inventory on the User document eliminate join queries; the `completionLog` array on each Habit stores the full audit trail in one `User.findById` call |
| Authentication | JWT (jsonwebtoken 9) + bcryptjs 2 | Stateless 7-day tokens avoid a session store; bcrypt with cost factor 10 at registration |
| Security middleware | helmet 8 + express-rate-limit 8 + express-mongo-sanitize 2 + xss-clean 0.1 | Helmet sets security response headers; rate limiter caps general API at 100 req/15 min and auth endpoints at 10 req/hour per IP; mongo-sanitize strips `$` and `.` from request bodies to block operator injection; xss-clean sanitizes embedded HTML |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser  (React 18 SPA, Vite 5)                             │
│                                                              │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ Zustand stores   │  │ Framer Motion  │  │ lottie-react│  │
│  │  authStore       │  │ (UI + pet anim)│  │ + PNG sprites│ │
│  │  petStore        │  └────────────────┘  └─────────────┘  │
│  │  (persist to LS) │                                        │
│  └──────────────────┘                                        │
│                                                              │
│  fetchWithAuth()  →  Bearer token from localStorage          │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP / REST (JSON)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Express 4 API  (Node.js)                                    │
│                                                              │
│  helmet / express-rate-limit / mongoSanitize / xss-clean     │
│                                                              │
│  POST /api/auth/register|login                               │
│  PUT  /api/auth/update-password      ← auth                  │
│  GET|POST /api/pet                   ← auth                  │
│  GET|POST|DELETE /api/habits         ← auth + dailyReset     │
│  GET|POST /api/shop                  ← auth                  │
│                                                              │
│  calculateEvolution(pet)   called on every XP mutation       │
└──────────────────────────┬───────────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  MongoDB  (Atlas or local)                                   │
│                                                              │
│  users  (single collection)                                  │
│    ├── pet               embedded subdocument                │
│    ├── habits[]          array of embedded subdocuments      │
│    │     └── completionLog[]   per-habit audit trail         │
│    └── inventory         embedded subdocument                │
└──────────────────────────────────────────────────────────────┘
```

All game state embeds in a single MongoDB document per user. The most common read — loading the dashboard — fetches everything in one `User.findById` call with no joins. The tradeoff is that the `habits` array is unbounded: at scale, a dedicated Habits collection with a `userId` index would be necessary once `completionLog` arrays grow large enough to push documents toward MongoDB's 16 MB document ceiling.

The `dailyReset` middleware checks whether `lastLogin` and `Date.now()` fall on different UTC calendar dates using `setHours(0, 0, 0, 0)` comparison, not whether 24 hours have elapsed. A user who logs in at 23:55 and again at 00:05 triggers a reset — intentional for habit-tracking semantics. Habits completed the previous day keep their streaks; habits that were skipped have their streaks reset to 0. A `freezeProtectionUntil` timestamp on the User document overrides the streak break and is consumed (nulled) after use.

---

## How It Works

1. **Registration** — `POST /api/auth/register` creates a User document with the chosen species, initializes `pet.stats` to `{str: 10, int: 10, spi: 10}`, sets `totalXp: 0` and `stage: 1`, hashes the password with bcrypt (cost 10), and returns a 7-day JWT signed with `JWT_SECRET`.

2. **Daily reset** — every request to `/api/habits` passes through `dailyReset` middleware. If the current UTC calendar date is later than `lastLogin`'s date, habits not completed the previous day lose their streak. If `freezeProtectionUntil > Date.now()`, only `isCompletedToday` resets, streaks are preserved, and the token is consumed.

3. **Quest completion** — `POST /api/habits/:id/complete` awards `10 * difficulty` XP to `pet.totalXp` and `5 * difficulty` points to the habit's stat key, then calls `calculateEvolution(pet)`. If `totalXp >= 500`, the function checks `Math.max(str, int, spi) >= 2 * Math.min(str, int, spi)`; a pure build produces `SPECIES_STAT_PURE`, a balanced build produces `SPECIES_HYBRID`. If `totalXp >= 100` but under 500, the dominant stat is appended to produce the stage 2 path. Coins are awarded as `5 * difficulty + Math.min(streak, 7)`.

4. **Evolution cinematics** — the React client detects a stage transition by comparing `response.pet.totalXp` to the stage threshold and the current `pet.stage` in Zustand. `EvolutionEvent` runs three phases: `intro` (mount) → `charge` at 900 ms (grayscale pulse, expanding amber rings) → `transform` at 2200 ms (new form scales in with Framer `backOut` and a sound effect). Lottie JSON animations cover all three Ember stages; PNG images cover Aqua and Terra.

5. **Focus timer XP** — on completion, the client calls `habitsApi.create`, then `habitsApi.complete`, then `habitsApi.delete` in sequence. Difficulty is `Math.min(3, Math.ceil(duration / 20))`, so a 5-minute session yields 10 XP and a 60-minute session yields 30 XP. Evolution can trigger from a timer session.

6. **HP decay** — `POST /api/pet/decay` checks `(Date.now() - lastLogin.getTime()) / 3600000 > 24`. If true, HP becomes `Math.max(0, Math.round(hp * 0.9))` and all `isCompletedToday` fields reset. The client calls this at app mount; calling it multiple times within a 24-hour window is safe because `lastLogin` updates to `new Date()` on every call.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB Atlas cluster (free tier sufficient) or MongoDB 6+ running locally

### Installation

```bash
# Clone the repository
git clone https://github.com/parthiv-2006/Anima.git
cd Anima

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Configuration

Create `server/.env`:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/anima` or `mongodb://localhost:27017/anima` |
| `JWT_SECRET` | Random string of at least 32 characters used to sign and verify JWT tokens |
| `GROQ_API_KEY` | Groq API key — enables AI pet companion chat and adventure log narration ([get one free](https://console.groq.com)) |
| `PORT` | Port for the Express server (defaults to `5000` if unset) |
| `NODE_ENV` | Set to `production` to restrict CORS to `CLIENT_URL`; omit or set to `development` for open CORS |
| `CLIENT_URL` | Origin URL of the deployed frontend — required when `NODE_ENV=production` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for production rate limiting (disabled when absent) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |

Create `client/.env`:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the Express API, e.g. `http://localhost:5000/api` |

### Running Locally

```bash
# Terminal 1 — API server (port 5000 by default)
cd server
npm run dev

# Terminal 2 — Vite dev server (port 5173 by default)
cd client
npm run dev
```

Open `http://localhost:5173`.

---

## Testing

### Unit & Integration Tests (Vitest + Supertest)

Server tests use an in-memory MongoDB — no external database required.

```bash
# Run everything
npm test

# Server only (unit + integration)
npm run test:server

# Client only (unit)
npm run test:client

# Watch mode
npm run test:watch -w server

# Coverage report
npm run test:coverage -w server
```

**Server unit tests** cover `calculateEvolution()` (all 6 stage/path branches) and `getLocalDateKey()`.

**Server integration tests** hit the real Express app (supertest) with an in-memory MongoDB — auth registration, login, habit CRUD, habit completion with XP/stat/coin math, duplicate-completion guard, reset revert, and adventure log aggregation.

**Client unit tests** cover the `speciesTheme.js` utility (`getSpeciesTheme`, `speciesCssVars`, unknown-species fallback).

### E2E Tests (Playwright)

Requires both dev servers running (`npm run dev:server` in one terminal, `npm run dev:client` in another) and `GROQ_API_KEY` in `server/.env`.

```bash
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

E2E flows: register, login, create habit, complete habit, view adventure log, open Pet Chat, send a message.

---

## Project Structure

```
Anima/
├── client/                              ← Vite + React SPA
│   ├── src/
│   │   ├── App.jsx                      ← Root component; view routing, data loading, modal orchestration
│   │   ├── components/
│   │   │   ├── AnimatedPet.jsx          ← PNG sprite renderer; weighted animation state machine (5 states)
│   │   │   ├── PetStage.jsx             ← Habitat panel; HP/XP bars, speech bubble, background overlay
│   │   │   ├── QuestCard.jsx            ← Habit card; optimistic toggle, confetti, floating XP label
│   │   │   ├── EvolutionEvent.jsx       ← Three-phase cinematic modal; Lottie for Ember, PNG for others
│   │   │   ├── FocusTimer.jsx           ← Pomodoro timer; localStorage persistence; awards XP on finish
│   │   │   ├── ItemShop.jsx             ← Shop modal; consumables and themed backgrounds
│   │   │   ├── HabitRadar.jsx           ← Recharts radar chart for STR/INT/SPI triangle
│   │   │   ├── ProductivityHeatmap.jsx  ← Calendar heatmap from server-aggregated completionLog data
│   │   │   ├── WeeklyInsightsTimeline.jsx  ← Weekly bar chart breakdown by stat category
│   │   │   ├── AdventureLog.jsx         ← Flat sorted list of all completion events
│   │   │   ├── HabitRecommendations.jsx ← Rule-based suggestions keyed to weakest stat
│   │   │   ├── AmbientMode.jsx          ← Full-screen overlay; randomized thought bubbles every 20-40 min
│   │   │   ├── OnboardingWizard.jsx     ← Multi-step first-run flow for new accounts
│   │   │   ├── AuthForm.jsx             ← Login/register form with species selection
│   │   │   ├── SettingsForm.jsx         ← Password change and avatar selection
│   │   │   ├── HabitForm.jsx            ← Quest creation form with stat and difficulty picker
│   │   │   ├── QuestCompletionModal.jsx ← Confirmation dialog with optional completion note input
│   │   │   └── MiniQuestLog.jsx         ← Compact sidebar summary of today's quest progress
│   │   ├── state/
│   │   │   ├── authStore.js             ← Zustand store; localStorage persistence; isHydrated guard
│   │   │   └── petStore.js              ← Zustand store for live pet state during session
│   │   ├── services/
│   │   │   └── api.js                   ← Fetch wrapper; Bearer token injection; 401 auto-logout
│   │   ├── lotties/                     ← Bundled Lottie JSON: Ember baby/teen/adult, Aqua baby, Terra baby
│   │   └── index.css                    ← Tailwind directives + Cinzel and DM Sans font imports
│   ├── tailwind.config.js               ← Semantic tokens: background, surface, accent, stat colors, glows
│   └── vite.config.js
│
└── server/
    └── src/
        ├── index.js                     ← Bootstrap: security middleware stack, route mounting, DB connect
        ├── config/db.js                 ← Mongoose connect with 5s serverSelectionTimeoutMS
        ├── middleware/
        │   ├── auth.js                  ← JWT Bearer token verification; sets req.userId
        │   └── dailyReset.js            ← UTC calendar day boundary check; streak logic; freeze protection
        ├── models/
        │   ├── User.js                  ← Root document; embeds Pet, Habit[], Inventory
        │   ├── Pet.js                   ← Subdocument: species, stage, hp, stats, totalXp, evolutionPath
        │   ├── Habit.js                 ← Subdocument with completionLog[] audit array
        │   └── Inventory.js             ← Subdocument: healthPotions, freezeStreaks, backgrounds[], activeBackground
        ├── controllers/
        │   ├── authController.js        ← register, login, updatePassword
        │   ├── petController.js         ← getPet, updatePet, applyDecay; exports calculateEvolution()
        │   ├── habitController.js       ← CRUD + complete/reset + history aggregation + recommendations
        │   └── shopController.js        ← getItems, purchaseItem, useItem, setBackground, getInventory
        ├── routes/                      ← Express Router files wiring controllers to HTTP verbs
        └── data/shopItems.js            ← Static catalog: 3 consumables + 6 backgrounds with prices and effects
```

---

## Known Limitations

- **Plain JavaScript throughout** — neither client nor server uses TypeScript; a mistyped stat key (e.g. `strength` instead of `str`) silently awards 0 points with no compile-time or runtime error
- **Unbounded habits array** — habits and their `completionLog` entries embed in the User document; MongoDB's 16 MB document limit becomes a concern after years of daily completions across many habits
- **UTC-only daily reset** — `dailyReset` uses UTC calendar boundaries; users in large negative UTC offsets (UTC-8 to UTC-12) experience their "midnight reset" between 4 PM and 8 PM local time, which does not match a realistic habit day
- **Mixed animation quality across species** — the evolution cinematic uses Lottie JSON (vector quality, bundled) for all three Ember stages, but falls back to static PNGs for Aqua and Terra stages 2 and 3; the visual fidelity is inconsistent depending on species choice
- **AI narration regenerates on every log open** — narratives are held in React component state and regenerated each time the Adventure Log mounts; a short cache (localStorage or a DB field) would avoid redundant Groq calls

---

## What I Would Build Next

- **TypeScript migration** — `calculateEvolution()` and the habit completion response shape are the highest-value targets; a mismatched stat key currently produces silent 0 XP awards that TypeScript's strict mode would catch at build time
- **Lottie animations for all species** — Aqua and Terra fall back to PNGs at stages 2 and 3; commissioning or sourcing Lottie files for all 9 evolution paths would make the cinematic consistent regardless of species choice, which matters most for the stage 3 reveal
- **Real-time XP bar via WebSockets** — the XP bar only updates after a full `loadData()` round-trip; a Socket.io event pushed from the server on every XP mutation would let the bar fill continuously during an active focus timer session, connecting the pet's `TRAINING` animation to live progress without polling
- **Dedicated Habits collection** — moving habits from an embedded array to a separate MongoDB collection indexed on `userId` removes the document-size ceiling, enables server-side pagination on the adventure log, and makes cross-user analytics possible without loading full user documents
- **Curated habit template library** — the `getHabitRecommendations` endpoint returns 15 hardcoded suggestions; a filterable library of 50 to 100 goal-tagged templates (marathon training, language learning, deep work) would let users bootstrap a full quest log without manually designing each habit

---

## License

[MIT](LICENSE)

---

Built by [Parthiv Paul](https://github.com/parthiv-2006)
