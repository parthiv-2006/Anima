# Evo-Habit (MERN)

Monorepo for the Evo-Habit "Tamagotchi for Productivity" app.

## Stack
- Frontend: Vite + React, TailwindCSS, Framer Motion, lottie-react, Recharts, Zustand, canvas-confetti
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth

## Quickstart
1) Install dependencies from the repo root:
```
npm install
```

2) Environment variables:
- Copy `packages/server/.env.example` to `packages/server/.env` and set `MONGODB_URI` and `JWT_SECRET`.

3) Run dev servers (two terminals):
- API: `npm run dev:server`
- Web: `npm run dev:client`

## Project layout
- packages/client: React app with sample PetStage, QuestCard, EvolutionEvent components and Tailwind setup
- packages/server: Express API with auth, pet, and habit routes plus evolution/decay logic stubs
- Instructions: Original product brief for reference

## Next steps
- Wire client to the API (login/register, fetch pet/habits, optimistic updates)
- Replace placeholder Lottie JSON with real assets from LottieFiles per evolution paths
- Add tests (API + UI) and tighten validation/error handling