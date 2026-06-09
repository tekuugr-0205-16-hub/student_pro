import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getStats } from "../api"
import "./Dashboard.css"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">Loading...</div>
  if (!stats) return <div className="loading-state">Could not connect to backend. Make sure it's running on port 5000.</div>

  const { assignments, urgentDeadlines, focus, streak } = stats

  const hour = new Date().getHours()
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="dashboard">
      <div className="dash-top">
        <div>
          <p className="dash-greet">{greet}</p>
          <h1>Ready to focus? 🔥</h1>
        </div>
        <div className="streak-box">
          <span style={{ fontSize: "1.6rem" }}>🔥</span>
          <div>
            <div className="streak-num">{streak.current}</div>
            <div className="streak-label">day streak</div>
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-label">Done</div>
          <div className="stat-num">{assignments.completed}/{assignments.total}</div>
          <div className="stat-sub">{assignments.completionRate}% complete</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">In Progress</div>
          <div className="stat-num">{assignments.inProgress}</div>
          <div className="stat-sub">{assignments.notStarted} not started</div>
        </div>
        <div className={`stat-card ${assignments.overdue > 0 ? "red" : "green"}`}>
          <div className="stat-label">Overdue</div>
          <div className="stat-num">{assignments.overdue}</div>
          <div className="stat-sub">{assignments.overdue > 0 ? "Needs attention" : "All good!"}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Focus Today</div>
          <div className="stat-num">{focus.minutesToday}m</div>
          <div className="stat-sub">{focus.sessionsToday} sessions</div>
        </div>
      </div>

      <div className="dash-bottom">
        {/* urgent deadlines */}
        <div className="card">
          <div className="section-head">
            <h2>Urgent Deadlines</h2>
            <Link to="/assignments" className="see-all">See all →</Link>
          </div>
          {urgentDeadlines.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <div className="icon">🎉</div>
              <h3>No urgent deadlines</h3>
            </div>
          ) : urgentDeadlines.map(a => {
            const days = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
            const label = days <= 0 ? "Due today" : days === 1 ? "Tomorrow" : `${days} days`
            const color = days <= 1 ? "#f87171" : "#fbbf24"
            return (
              <div key={a.id} className="deadline-row">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`tag tag-${a.subject?.toLowerCase() || "general"}`}>{a.subject}</span>
                  <span className="deadline-title">{a.title}</span>
                </div>
                <span style={{ color, fontSize: 13, fontFamily: "monospace", whiteSpace: "nowrap" }}>{label}</span>
              </div>
            )
          })}
        </div>

        {/* right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h2 style={{ marginBottom: 16 }}>Quick Actions</h2>
            {[
              { to: "/timer", icon: "⏱", label: "Start Pomodoro" },
              { to: "/assignments", icon: "➕", label: "Add Assignment" },
              { to: "/notes", icon: "📝", label: "New Note" },
              { to: "/grades", icon: "📊", label: "Check GPA" },
            ].map(item => (
              <Link key={item.to} to={item.to} className="quick-link">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: 12 }}>Focus Goal</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(100, (focus.minutesToday / 200) * 100)}%` }} />
            </div>
            <div className="progress-labels">
              <span>{focus.minutesToday} min</span>
              <span>200 min goal</span>
            </div>
            <Link to="/timer" className="btn btn-primary" style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
              Start Focusing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
