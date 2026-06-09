import { NavLink } from "react-router-dom"
import "./Sidebar.css"

const links = [
  { to: "/", label: "Dashboard", icon: "⬡" },
  { to: "/assignments", label: "Assignments", icon: "📋" },
  { to: "/timer", label: "Focus Timer", icon: "⏱" },
  { to: "/grades", label: "Grades", icon: "📊" },
  { to: "/notes", label: "Notes", icon: "📝" },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">⚡</span>
        <div>
          <div className="brand-name">StudentOS</div>
          <div className="brand-sub">ECE · ML · Focus</div>
        </div>
      </div>

      <nav className="nav-links">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">EC</div>
        <div>
          <div className="user-name">ECE Student</div>
          <div className="user-sub">Year 3 · ML Track</div>
        </div>
      </div>
    </aside>
  )
}
