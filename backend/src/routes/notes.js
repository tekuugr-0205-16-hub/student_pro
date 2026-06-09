const express = require("express")
const router = express.Router()
const { store, uuidv4 } = require("../store")

// get all notes, pinned ones first
router.get("/", (req, res) => {
  let list = [...store.notes]

  if (req.query.subject) {
    list = list.filter(n => n.subject === req.query.subject)
  }

  if (req.query.q) {
    const q = req.query.q.toLowerCase()
    list = list.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  // pinned notes go to top
  list.sort((a, b) => b.pinned - a.pinned)

  res.json(list)
})

// create a note
router.post("/", (req, res) => {
  const { title, content, subject, tags } = req.body

  if (!title) return res.status(400).json({ error: "title is required" })

  const note = {
    id: uuidv4(),
    title,
    content: content || "",
    subject: subject || "General",
    tags: Array.isArray(tags) ? tags : [],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  store.notes.unshift(note)
  res.status(201).json(note)
})

// update a note
router.patch("/:id", (req, res) => {
  const i = store.notes.findIndex(n => n.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: "not found" })

  store.notes[i] = { ...store.notes[i], ...req.body, updatedAt: new Date().toISOString() }
  res.json(store.notes[i])
})

// delete a note
router.delete("/:id", (req, res) => {
  const i = store.notes.findIndex(n => n.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: "not found" })
  store.notes.splice(i, 1)
  res.json({ message: "deleted" })
})

module.exports = router
