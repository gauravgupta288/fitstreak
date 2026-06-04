# FitStreak ⚡

FitStreak is a modern, premium, mobile-first workout tracking application designed to help users log exercises, maintain daily streaks, view analytics charts, and gamify their progress through levels, XP, and milestone badges.

---

## 🚀 Key Features

1. **User Authentication & Authorization**: Custom secure register/login with JWT and bcrypt password hashing.
2. **Interactive Dashboard**:
   - Live & longest streak counters.
   - Total workout stats.
   - Motivational quotes randomly selected.
   - Interactive weekly completion tracker.
3. **Dynamic Workout Logging**: Add, edit, or delete workouts. Add multiple exercises dynamically with sets, reps, weight (kg), duration, and custom focus notes.
4. **Seed Exercise Library**: Autocompletion helper built into the exercise forms.
5. **Analytics & Progress**:
   - Monthly workout calendar mapping logged training days.
   - Dynamic weight progress charts using **Recharts**.
   - Personal Records (PRs) tracker summarizing highest weights and reps.
6. **Gamified Ranks**: Earn 100 XP per workout (plus streak bonuses) to level up. Unlock badges like *Flame Starter* (3d), *Consistency Guru* (7d), *Iron Will* (14d), *Unstoppable* (30d), *Gym Deity* (60d), and *FitStreak Legend* (100d).
7. **Premium Responsive Design**: Glassmorphism elements, transitions, and layout designed to look stunning on mobile displays and render like a smartphone shell on desktops.

---

## 🛠️ Tech Stack

* **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts
* **Backend**: Node.js, Express, Mongoose
* **Database**: MongoDB (via Mongoose schemas)
* **Auth**: JWT (JSON Web Tokens), bcryptjs

---

## 📂 Project Structure

```
dazzling-curie/
├── package.json              # Monorepo coordinator scripts
├── client/                   # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable components (Header, Nav, RouteGuard)
│   │   ├── context/          # AuthState & user session caching
│   │   ├── pages/            # View pages (Dashboard, Add, History, Progress, Profile)
│   │   ├── utils/            # API client (injects token & client local date)
│   │   └── App.tsx           # Page routing
│   ├── vite.config.ts        # Tailwind v4 plugin configuration
│   └── index.html
└── server/                   # Node/Express API server
    ├── src/
    │   ├── config/           # Database connector
    │   ├── controllers/      # Route handler controllers (Auth, Workout, Exercise)
    │   ├── middleware/       # JWT protection verification
    │   ├── models/           # Mongoose schemas (User, Workout, ExerciseLibrary)
    │   ├── routes/           # API endpoints routing
    │   └── seed.ts           # Exercise seeding script
    └── tsconfig.json
```

---

## ⚙️ Prerequisites & Setup

Ensure you have **Node.js** (v18+) and **MongoDB** installed and running on your system.

### 1. Install Dependencies
Run the command below in the project root to install the dependencies for the monorepo root, client, and server packages:
```bash
npm run install:all
```
*(Note: If npm cache permission errors occur, the command will execute using a local cache path fallback inside the workspace.)*

### 2. Configure Environment Variables
Create `.env` files in both directories (templates are provided as `.env.example` files):

* **For the Server (`server/.env`)**:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/fitstreak
  JWT_SECRET=your_secret_key_here
  ```
  *(Replace the MONGODB_URI with a MongoDB Atlas link if you aren't running MongoDB locally).*

* **For the Client (`client/.env`)**:
  ```env
  VITE_API_URL=http://localhost:5000
  ```

---

## 💻 Running the App

### 1. Seed the Exercise Library
Populate the database with the pre-seeded library of exercises:
```bash
npm run seed
```

### 2. Start Development Servers
Run the command below at the root directory to launch both the backend server and client Vite server concurrently:
```bash
npm run dev
```
* **Frontend client**: http://localhost:5173
* **Backend API**: http://localhost:5000

---

## 🔗 Key API Endpoints

### Authentication
* `POST /api/auth/register` - Create user profile
* `POST /api/auth/login` - Verify credentials & issue token
* `GET /api/auth/me` - Retrieve current user profile (requires Bearer token)

### Workouts (All require Bearer token)
* `POST /api/workouts` - Create/log workout session (updates user streaks/XP/level)
* `GET /api/workouts` - List user history
* `GET /api/workouts/stats` - Fetch aggregate analytics (calendar active days, PRs, progression data)
* `GET /api/workouts/:id` - Fetch single workout session details
* `PUT /api/workouts/:id` - Update session exercises, notes, duration
* `DELETE /api/workouts/:id` - Delete session

### Exercise Library (Requires Bearer token)
* `GET /api/exercises` - Retrieve pre-seeded exercise template list

---

## 📈 Streak & XP Progression Rules

1. **Streak Validation**:
   - Streaks are advanced if consecutive workouts are logged (separated by exactly 1 day).
   - If multiple workouts are logged on the same day, the streak is maintained.
   - If a workout is logged for a historical/past date, the streak is unaffected.
   - Streaks automatically reset to 0 if a gap of more than 1 day from the client's current date is observed on login or profile fetching.
2. **XP progression**:
   - Logs award `100 XP` base.
   - Logs award a streak bonus: `currentStreak * 10 XP` to encourage consistency.
   - Level is calculated as: `Level = floor(XP / 500) + 1`.
