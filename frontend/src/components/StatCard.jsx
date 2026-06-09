import "./StatCard.css";

export default function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div className={`stat-card ${accent ? `stat-${accent}` : ""}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
