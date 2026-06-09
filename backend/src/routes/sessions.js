const express = require("express")
const router = express.Router()
const { store, uuidv4 } = require("../store")

// get today's session summary
router.get("/today", (req, res) => {
  const today = new Date().toDateString()
  const todaySessions = store.sessions.filter(s =>
    new Date(s.startedAt).toDateString() === today && s.completed
  )

  const totalMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  res.json({
    sessions: todaySessions,
    totalMinutes,
    totalSessions: todaySessions.length,
    focusGoalMinutes: 200,
    progressPct: Math.min(100, Math.round((totalMinutes / 200) * 100)),
  })
})

// log a completed pomodoro session
router.post("/", (req, res) => {
  const { durationMinutes, subject, taskLabel, completed } = req.body

  const session = {
    id: uuidv4(),
    durationMinutes: Number(durationMinutes),
    subject: subject || "General",
    taskLabel: taskLabel || "Focus session",
    completed: completed !== false,
    startedAt: new Date().toISOString(),
  }

  store.sessions.push(session)

  // update the streak
  const today = new Date().toDateString()
  if (store.streak.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (store.streak.lastActiveDate === yesterday) {
      store.streak.current += 1
    } else {
      store.streak.current = 1
    }
    store.streak.lastActiveDate = today
    if (store.streak.current > store.streak.longest) {
      store.streak.longest = store.streak.current
    }
  }

  res.status(201).json({ session, streak: store.streak })
})

module.exports = router
