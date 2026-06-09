import { useEffect, useState } from "react";
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from "../api";
import "./Assignments.css";

const SUBJECTS = ["ECE", "ML", "General", "Math", "Physics"];
const PRIORITIES = ["urgent", "high", "medium", "low"];
const STATUSES = ["not-started", "in-progress", "completed"];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function AddModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", subject: "ECE", course: "", dueDate: "", priority: "medium", notes: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.title.trim() || !form.dueDate) { setErr("Title and due date are required"); return; }
    setSaving(true);
    try {
      const a = await createAssignment(form);
      onCreated(a);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>New Assignment</h2>
          <button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={onClose}>✕</button>
        </div>

        {err && <div className="form-error">{err}</div>}

        <div className="form-group">
          <label>Title</label>
          <input value={form.title} onChange={set("title")} placeholder="e.g. Implement Gradient Descent" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Subject</label>
            <select value={form.subject} onChange={set("subject")}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Course Code</label>
            <input value={form.course} onChange={set("course")} placeholder="e.g. ECE 3050" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={set("dueDate")} />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={set("priority")}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Any details..." />
        </div>

        <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Add Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    setLoading(true);
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch (e) {
      console.error("Failed to load assignments", e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(a) {
    const next = a.status === "completed" ? "in-progress" : a.status === "in-progress" ? "completed" : "in-progress";
    const updated = await updateAssignment(a.id, { status: next });
    setAssignments((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this assignment?")) return;
    await deleteAssignment(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  const visible = assignments.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterSubject !== "all" && a.subject !== filterSubject) return false;
    return true;
  });

  return (
    <div className="assignments-page">
      <div className="page-header">
        <div>
          <h1>Assignments</h1>
          <p>Track every task across your ECE and ML courses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="filter-group">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              className={`filter-btn ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : s.replace("-", " ")}
            </button>
          ))}
        </div>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="subject-filter"
        >
          <option value="all">All subjects</option>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading assignments…</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>No assignments found</h3>
          <p>Try changing filters or add a new assignment</p>
        </div>
      ) : (
        <div className="assignment-list">
          {visible.map((a) => {
            const days = daysUntil(a.dueDate);
            const isOverdue = days < 0 && a.status !== "completed";
            return (
              <div key={a.id} className={`assignment-card ${a.status === "completed" ? "done" : ""} ${isOverdue ? "overdue" : ""}`}>
                <button
                  className={`check-btn ${a.status === "completed" ? "checked" : ""}`}
                  onClick={() => toggleStatus(a)}
                  title="Toggle status"
                >
                  {a.status === "completed" ? "✓" : ""}
                </button>

                <div className="a-body">
                  <div className="a-top">
                    <span className={`tag tag-${a.subject?.toLowerCase() || "general"}`}>{a.subject}</span>
                    <span className={`badge badge-${a.priority}`}>{a.priority}</span>
                    {a.course && <span className="a-course">{a.course}</span>}
                  </div>
                  <div className="a-title">{a.title}</div>
                  {a.notes && <div className="a-notes">{a.notes}</div>}
                </div>

                <div className="a-right">
                  <div className={`a-due ${isOverdue ? "overdue-text" : days <= 1 ? "warn-text" : ""}`}>
                    {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : days === 1 ? "Tomorrow" : formatDate(a.dueDate)}
                  </div>
                  <div className={`status-pill status-${a.status}`}>{a.status.replace("-", " ")}</div>
                  <button className="del-btn" onClick={() => handleDelete(a.id)} title="Delete">🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onCreated={(a) => setAssignments((prev) => [a, ...prev])}
        />
      )}
    </div>
  );
}
