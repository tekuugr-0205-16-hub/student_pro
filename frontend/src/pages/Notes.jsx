import { useEffect, useState, useRef } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "../api";
import "./Notes.css";

const SUBJECTS = ["ECE", "ML", "General", "Math", "Physics"];

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NoteEditor({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [subject, setSubject] = useState(note?.subject || "General");
  const [tags, setTags] = useState(note?.tags?.join(", ") || "");
  const [saving, setSaving] = useState(false);
  const taRef = useRef(null);

  useEffect(() => {
    if (taRef.current) taRef.current.focus();
  }, []);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      const saved = note
        ? await updateNote(note.id, { title, content, subject, tags: tagArr })
        : await createNote({ title, content, subject, tags: tagArr });
      onSave(saved, !!note);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-header">
          <h2>{note ? "Edit Note" : "New Note"}</h2>
          <button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={onClose}>✕</button>
        </div>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title…" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="circuits, exam-prep" />
          </div>
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea ref={taRef} rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes here…" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }} />
        </div>
        <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "flex-end", marginTop: "var(--sp-2)" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [editing, setEditing] = useState(null);   // note object or "new"
  const [expanded, setExpanded] = useState(null);  // id

  useEffect(() => { loadNotes(); }, []);

  async function loadNotes(q = "", subj = "") {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (subj && subj !== "all") params.subject = subj;
      setNotes(await getNotes(params));
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(val) {
    setSearch(val);
    loadNotes(val, filterSubject);
  }

  function handleSubject(val) {
    setFilterSubject(val);
    loadNotes(search, val);
  }

  async function togglePin(note) {
    const updated = await updateNote(note.id, { pinned: !note.pinned });
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === note.id ? updated : n));
      return [...next.filter((n) => n.pinned), ...next.filter((n) => !n.pinned)];
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this note?")) return;
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function handleSaved(savedNote, isEdit) {
    if (isEdit) {
      setNotes((prev) => prev.map((n) => (n.id === savedNote.id ? savedNote : n)));
    } else {
      setNotes((prev) => [savedNote, ...prev]);
    }
  }

  return (
    <div className="notes-page">
      <div className="page-header">
        <div>
          <h1>Notes</h1>
          <p>Quick notes for ECE formulas, ML concepts, exam prep</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>
          + New Note
        </button>
      </div>

      {/* Search + filter */}
      <div className="notes-filters">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes, content, tags…"
          />
          {search && <button className="search-clear" onClick={() => handleSearch("")}>✕</button>}
        </div>
        <select value={filterSubject} onChange={(e) => handleSubject(e.target.value)} style={{ width: "auto", minWidth: "140px" }}>
          <option value="all">All subjects</option>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading notes…</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📝</div>
          <h3>{search ? "No notes matched your search" : "No notes yet"}</h3>
          <p>Start capturing your study notes</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.id} className={`note-card card ${note.pinned ? "pinned" : ""}`}>
              <div className="note-header">
                <div className="note-meta">
                  <span className={`tag tag-${note.subject?.toLowerCase() || "general"}`}>{note.subject}</span>
                  <span className="note-time">{timeAgo(note.updatedAt)}</span>
                </div>
                <button className={`pin-btn ${note.pinned ? "pinned" : ""}`} onClick={() => togglePin(note)} title={note.pinned ? "Unpin" : "Pin"}>
                  📌
                </button>
              </div>

              <h3 className="note-title">{note.title}</h3>

              {note.content && (
                <div
                  className={`note-content ${expanded === note.id ? "expanded" : ""}`}
                  onClick={() => setExpanded(expanded === note.id ? null : note.id)}
                >
                  {note.content}
                </div>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map((t) => (
                    <span key={t} className="note-tag">#{t}</span>
                  ))}
                </div>
              )}

              <div className="note-actions">
                <button className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "4px 12px" }} onClick={() => setEditing(note)}>
                  Edit
                </button>
                <button className="btn btn-danger" style={{ fontSize: "0.78rem", padding: "4px 12px" }} onClick={() => handleDelete(note.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <NoteEditor
          note={editing === "new" ? null : editing}
          onSave={handleSaved}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
