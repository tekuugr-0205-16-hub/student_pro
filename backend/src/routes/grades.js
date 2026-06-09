const express = require("express")
const router = express.Router()
const { store, uuidv4 } = require("../store")

// calculate weighted average for a course
function getAverage(assignments) {
  if (!assignments || assignments.length === 0) return null

  let totalWeight = 0
  let total = 0

  for (const a of assignments) {
    const pct = (a.score / a.maxScore) * 100
    total += pct * a.weight
    totalWeight += a.weight
  }

  if (totalWeight === 0) return null
  return Math.round((total / totalWeight) * 10) / 10
}

function getLetter(pct) {
  if (pct >= 93) return "A"
  if (pct >= 90) return "A-"
  if (pct >= 87) return "B+"
  if (pct >= 83) return "B"
  if (pct >= 80) return "B-"
  if (pct >= 77) return "C+"
  if (pct >= 73) return "C"
  if (pct >= 70) return "C-"
  if (pct >= 60) return "D"
  return "F"
}

function getGpaPoints(letter) {
  const map = { "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0 }
  return map[letter] ?? 0
}

// get all courses with grades
router.get("/", (req, res) => {
  const courses = store.grades.map(g => {
    const avg = getAverage(g.assignments)
    const letter = avg !== null ? getLetter(avg) : "N/A"
    const gpaPoints = avg !== null ? getGpaPoints(letter) : null
    return { ...g, currentGrade: avg, letterGrade: letter, gpaPoints }
  })

  // calculate overall gpa
  const graded = courses.filter(c => c.gpaPoints !== null)
  let totalCredits = 0
  let totalPoints = 0
  for (const c of graded) {
    totalCredits += c.credits
    totalPoints += c.gpaPoints * c.credits
  }
  const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : null

  res.json({ courses, gpa, totalCredits })
})

// add a new course
router.post("/", (req, res) => {
  const { course, courseName, subject, credits } = req.body
  if (!course || !courseName) return res.status(400).json({ error: "need course code and name" })

  const newCourse = {
    id: uuidv4(),
    course,
    courseName,
    subject: subject || "General",
    credits: credits || 3,
    assignments: [],
  }

  store.grades.push(newCourse)
  res.status(201).json(newCourse)
})

// add a grade entry to a course
router.post("/:id/entries", (req, res) => {
  const course = store.grades.find(g => g.id === req.params.id)
  if (!course) return res.status(404).json({ error: "course not found" })

  const { name, score, maxScore, weight } = req.body
  course.assignments.push({
    name,
    score: Number(score),
    maxScore: Number(maxScore),
    weight: Number(weight)
  })

  const avg = getAverage(course.assignments)
  const letter = avg !== null ? getLetter(avg) : "N/A"
  res.json({ ...course, currentGrade: avg, letterGrade: letter })
})

// delete a course
router.delete("/:id", (req, res) => {
  const i = store.grades.findIndex(g => g.id === req.params.id)
  if (i === -1) return res.status(404).json({ error: "not found" })
  store.grades.splice(i, 1)
  res.json({ message: "deleted" })
})

module.exports = router
