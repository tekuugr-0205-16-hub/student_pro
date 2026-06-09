# StudentOS 🎓⚡

A personal academic command center built for ECE + ML students.
Tracks assignments, runs a Pomodoro timer, calculates GPA, and organizes study notes.

---

## Project Structure

```
studentos/
├── backend/          # Node.js + Express REST API
│   └── src/
│       ├── index.js         # Server entry point
│       ├── store.js         # In-memory data store (swap with MongoDB/SQLite later)
│       └── routes/
│           ├── assignments.js
│           ├── grades.js
│           ├── notes.js
│           ├── sessions.js  # Pomodoro sessions
│           └── stats.js     # Dashboard summary endpoint
│
└── frontend/         # React 18 SPA
    └── src/
        ├── App.jsx          # Router + layout shell
        ├── api.js           # All API calls in one place
        ├── index.css        # Global design tokens + utility classes
        ├── components/
        │   ├── Sidebar.jsx
        │   └── StatCard.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Assignments.jsx
            ├── Timer.jsx    # Full Pomodoro timer with AudioContext beep
            ├── Grades.jsx   # GPA calculator
            └── Notes.jsx    # Searchable notes with pin
```

---

## Getting Started

### 1. Start the backend

```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/stats | Dashboard summary |
| GET/POST | /api/assignments | List / create |
| PATCH/DELETE | /api/assignments/:id | Update / delete |
| GET/POST | /api/grades | Courses + GPA |
| POST | /api/grades/:id/entries | Add a grade entry |
| GET/POST | /api/notes | List / create |
| PATCH/DELETE | /api/notes/:id | Update / delete |
| POST | /api/sessions | Log a Pomodoro session |
| GET | /api/sessions/today | Today's focus summary |

---

## Switching to a real database

The `backend/src/store.js` file is the only place data lives.
Replace it with a MongoDB, SQLite, or PostgreSQL adapter and
update the route files to use `await db.find(...)` etc.
All the route logic stays exactly the same.

---

## Tech stack

- **Frontend**: React 18, React Router 6, vanilla CSS with CSS variables
- **Backend**: Node.js, Express 4, uuid
- **No build tools beyond CRA** — easy to run anywhere

Built for an ECE + ML student who needs focus, not complexity.
