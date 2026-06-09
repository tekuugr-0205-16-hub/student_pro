import { useEffect, useState } from "react";
import { getGrades, createCourse, addGradeEntry, deleteCourse } from "../api";
import "./Grades.css";

function gradeColor(pct) {
  if (pct >= 90) return "var(--accent)";
  if (pct >= 80) return "var(--blue)";
  if (pct >= 70) return "var(--warn)";
  return "var(--danger)";
}

function AddCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ course: "", courseName: "", subject: "ECE", credits: 3 });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    if (!form.course || !form.courseName) return;
    setSaving(true);
    try {
      const c = await createCourse({ ...form, credits: Number(form.credits) });
      onCreated(c);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Add Course</h2>
          <button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={onClose}>✕</button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Course Code</label>
            <input value={form.course} onChange={set("course")} placeholder="ECE 3050" />
          </div>
          <div className="form-group">
            <label>Credits</label>
            <input type="number" value={form.credits} onChange={set("credits")} min={1} max={6} />
          </div>
        </div>
        <div className="form-group">
          <label>Course Name</label>
          <input value={form.courseName} onChange={set("courseName")} placeholder="Digital Signal Processing" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Subject</label>
            <select value={form.subject} onChange={set("subject")}>
              {["ECE", "ML", "General", "Math", "Physics"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving || !form.course || !form.courseName}>
            {saving ? "Adding…" : "Add Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddEntryModal({ course, onClose, onUpdated }) {
  const [form, setForm] = useState({ name: "", score: "", maxScore: 100, weight: 20 });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    if (!form.name || form.score === "") return;
    setSaving(true);
    try {
      const updated = await addGradeEntry(course.id, { ...form, score: Number(form.score), maxScore: Number(form.maxScore), weight: Number(form.weight) });
      onUpdated(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Add Grade — {course.courseName}</h2>
          <button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={onClose}>✕</button>
        </div>
        <div className="form-group">
          <label>Assignment / Exam name</label>
          <input value={form.name} onChange={set("name")} placeholder="e.g. Midterm Exam" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Your Score</label>
            <input type="number" value={form.score} onChange={set("score")} placeholder="85" min={0} />
          </div>
          <div className="form-group">
            <label>Max Score</label>
            <input type="number" value={form.maxScore} onChange={set("maxScore")} min={1} />
          </div>
        </div>
        <div className="form-group">
          <label>Weight (% of final grade)</label>
          <input type="number" value={form.weight} onChange={set("weight")} min={1} max={100} />
        </div>
        <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving || !form.name || form.score === ""}>
            {saving ? "Saving…" : "Add Grade"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Grades() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [addingEntryFor, setAddingEntryFor] = useState(null); // course object

  useEffect(() => { loadGrades(); }, []);

  async function loadGrades() {
    setLoading(true);
    try {
      setData(await getGrades());
    } finally {
      setLoading(false);
    }
  }

  function handleCourseAdded(newCourse) {
    setData((d) => ({ ...d, courses: [...d.courses, { ...newCourse, currentGrade: null, letterGrade: "N/A", assignments: [] }] }));
  }

  function handleEntryAdded(updated) {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === updated.id ? updated : c)),
    }));
  }

  async function handleDeleteCourse(id) {
    if (!window.confirm("Remove this course?")) return;
    await deleteCourse(id);
    setData((d) => ({ ...d, courses: d.courses.filter((c) => c.id !== id) }));
  }

  if (loading) return <div className="loading-state">Loading grades…</div>;

  const { courses, gpa } = data;

  return (
    <div className="grades-page">
      <div className="page-header">
        <div>
          <h1>Grades & GPA</h1>
          <p>Track scores across all your courses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddCourse(true)}>
          + Add Course
        </button>
      </div>

      {/* GPA banner */}
      <div className="gpa-banner card">
        <div className="gpa-main">
          <div className="gpa-label">Cumulative GPA</div>
          <div className="gpa-value" style={{ color: gpa ? gradeColor(gpa * 25) : "var(--text-muted)" }}>
            {gpa !== null ? gpa.toFixed(2) : "—"}
          </div>
        </div>
        <div className="gpa-divider" />
        <div className="gpa-detail">
          <div className="gpa-stat">
            <span>{courses.filter((c) => c.currentGrade !== null).length}</span> graded courses
          </div>
          <div className="gpa-scale">
            <span style={{ color: "var(--accent)" }}>A = 4.0</span>
            <span style={{ color: "var(--blue)" }}>B = 3.0</span>
            <span style={{ color: "var(--warn)" }}>C = 2.0</span>
          </div>
        </div>
      </div>

      {/* Course cards */}
      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📊</div>
          <h3>No courses yet</h3>
          <p>Add a course to start tracking grades</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => {
            const pct = course.currentGrade;
            const color = pct !== null ? gradeColor(pct) : "var(--text-muted)";
            return (
              <div key={course.id} className="course-card card">
                <div className="course-top">
                  <div>
                    <div className="course-code-row">
                      <span className={`tag tag-${course.subject?.toLowerCase() || "general"}`}>{course.subject}</span>
                      <span className="course-code">{course.course}</span>
                      <span className="course-credits">{course.credits} cr</span>
                    </div>
                    <div className="course-name">{course.courseName}</div>
                  </div>
                  <div className="course-grade-display">
                    <span className="course-pct" style={{ color }}>{pct !== null ? `${pct}%` : "—"}</span>
                    <span className="course-letter" style={{ color }}>{course.letterGrade}</span>
                  </div>
                </div>

                {/* Grade progress bar */}
                {pct !== null && (
                  <div className="grade-bar-wrap">
                    <div className="grade-bar-bg">
                      <div className="grade-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )}

                {/* Grade entries */}
                {course.assignments && course.assignments.length > 0 && (
                  <div className="grade-entries">
                    {course.assignments.map((a, i) => (
                      <div key={i} className="grade-entry">
                        <span className="ge-name">{a.name}</span>
                        <span className="ge-score" style={{ color: gradeColor((a.score / a.maxScore) * 100) }}>
                          {a.score}/{a.maxScore}
                        </span>
                        <span className="ge-weight">{a.weight}%</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="course-actions">
                  <button className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "4px 12px" }} onClick={() => setAddingEntryFor(course)}>
                    + Add Grade
                  </button>
                  <button className="btn btn-danger" style={{ fontSize: "0.78rem", padding: "4px 12px" }} onClick={() => handleDeleteCourse(course.id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddCourse && <AddCourseModal onClose={() => setShowAddCourse(false)} onCreated={handleCourseAdded} />}
      {addingEntryFor && <AddEntryModal course={addingEntryFor} onClose={() => setAddingEntryFor(null)} onUpdated={handleEntryAdded} />}
    </div>
  );
}
