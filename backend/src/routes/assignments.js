const express = require("express")
const router = express.Router()
const { store, uuidv4 } = require("../store")

// get all assignments, sorted by due date
router.get("/", (req, res) => {
  let list = [...store.assignments]

  if (req.query.status) {
    list = list.filter(a => a.status === req.query.status)
  }
  if (req.query.subject) {
    list = list.filter(a => a.subject === req.query.subject)
  }

  list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  res.json(list)
})

// add a new assignment
router.post("/", (req, res) => {
  const { title, subject, course, dueDate, priority, notes } = req.body

  if (!title || !dueDate) {
    return res.status(400).json({ error: "need a title and due date" })
  }

  const item = {
    id: uuidv4(),
    title,
    subject: subject || "General",
    course: course || "",
    dueDate,
    priority: priority || "medium",
    status: "not-started",
    notes: notes || "",
    createdAt: new Date().toISOString(),
  }

  store.assignments.push(item)
  res.status(201).json(item)
})

// update status, notes, etc
router.patch("/:id", (req, res) => {
  const i = store.assignments.findIndex(a => a.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: "not found" })

  store.assignments[i] = { ...store.assignments[i], ...req.body }
  res.json(store.assignments[i])
})

// delete one
router.delete("/:id", (req, res) => {
  const i = store.assignments.findIndex(a => a.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: "not found" })
  store.assignments.splice(i, 1)
  res.json({ message: "deleted" })
})

module.exports = router
