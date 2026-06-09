const BASE = "http://localhost:5000/api"

// assignments
export async function getAssignments() {
  const res = await fetch(`${BASE}/assignments`)
  return res.json()
}

export async function createAssignment(data) {
  const res = await fetch(`${BASE}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updateAssignment(id, data) {
  const res = await fetch(`${BASE}/assignments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteAssignment(id) {
  await fetch(`${BASE}/assignments/${id}`, { method: "DELETE" })
}

// grades
export async function getGrades() {
  const res = await fetch(`${BASE}/grades`)
  return res.json()
}

export async function createCourse(data) {
  const res = await fetch(`${BASE}/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function addGradeEntry(courseId, data) {
  const res = await fetch(`${BASE}/grades/${courseId}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteCourse(id) {
  await fetch(`${BASE}/grades/${id}`, { method: "DELETE" })
}

// notes
export async function getNotes(search = "", subject = "") {
  let url = `${BASE}/notes?`
  if (search) url += `q=${search}&`
  if (subject) url += `subject=${subject}`
  const res = await fetch(url)
  return res.json()
}

export async function createNote(data) {
  const res = await fetch(`${BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updateNote(id, data) {
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteNote(id) {
  await fetch(`${BASE}/notes/${id}`, { method: "DELETE" })
}

// sessions / pomodoro
export async function getTodaySessions() {
  const res = await fetch(`${BASE}/sessions/today`)
  return res.json()
}

export async function logSession(data) {
  const res = await fetch(`${BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

// dashboard stats
export async function getStats() {
  const res = await fetch(`${BASE}/stats`)
  return res.json()
}
