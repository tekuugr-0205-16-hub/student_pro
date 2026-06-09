const express = require("express")
const router = express.Router()
const { store } = require("../store")

// dashboard summary - everything in one call
router.get("/", (req, res) => {
  const now = new Date()
  const today = now.toDateString()

  const total = store.assignments.length
  const completed = store.assignments.filter(a => a.status === "completed").length
  const inProgress = store.assignments.filter(a => a.status === "in-progress").length
  const notStarted = store.assignments.filter(a => a.status === "not-started").length
  const overdue = store.assignments.filter(a =>
    a.status !== "completed" && new Date(a.dueDate) < now
  ).length

  // assignments due in the next 2 days
  const urgentDeadlines = store.assignments
    .filter(a => {
      if (a.status === "completed") return false
      const diff = (new Date(a.dueDate) - now) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 2
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3)

  const todaySessions = store.sessions.filter(s =>
    new Date(s.startedAt).toDateString() === today && s.completed
  )
  const focusMinutesToday = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  res.json({
    assignments: {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
    urgentDeadlines,
    focus: {
      minutesToday: focusMinutesToday,
      sessionsToday: todaySessions.length,
    },
    streak: store.streak,
    notes: { total: store.notes.length },
  })
})

module.exports = router
