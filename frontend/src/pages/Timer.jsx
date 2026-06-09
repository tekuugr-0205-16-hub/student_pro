import { useState, useEffect, useRef, useCallback } from "react";
import { logSession, getTodaySessions } from "../api";
import "./Timer.css";

const MODES = [
  { key: "focus", label: "Focus", mins: 25, color: "var(--accent)" },
  { key: "short", label: "Short Break", mins: 5, color: "var(--blue)" },
  { key: "long", label: "Long Break", mins: 15, color: "var(--purple)" },
];

const SUBJECTS = ["ECE", "ML", "General", "Math", "Physics"];

export default function Timer() {
  const [modeIdx, setModeIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].mins * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0); // sessions today from timer
  const [subject, setSubject] = useState("ML");
  const [taskLabel, setTaskLabel] = useState("");
  const [todayData, setTodayData] = useState(null);
  const [sessionCount, setSessionCount] = useState(0); // local count this session

  const intervalRef = useRef(null);
  const startedRef = useRef(null); // track when session started

  const mode = MODES[modeIdx];
  const totalSecs = mode.mins * 60;
  const progress = (secondsLeft / totalSecs) * 100;

  // Load today's focus data
  useEffect(() => {
    getTodaySessions().then(setTodayData).catch(console.error);
  }, [completed]);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            handleSessionDone();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx]);

  async function handleSessionDone() {
    setRunning(false);
    if (mode.key === "focus") {
      try {
        await logSession({
          durationMinutes: mode.mins,
          subject,
          taskLabel: taskLabel || "Focus session",
          completed: true,
        });
        setCompleted((c) => c + 1);
        setSessionCount((c) => c + 1);
      } catch (e) {
        console.error("Couldn't log session", e);
      }
    }
    // Play a simple sound cue (browser beep using AudioContext)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = mode.key === "focus" ? 880 : 440;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1);
    } catch (_) {}
  }

  function switchMode(idx) {
    setModeIdx(idx);
    setSecondsLeft(MODES[idx].mins * 60);
    setRunning(false);
  }

  function handleStartStop() {
    if (!running && secondsLeft === totalSecs) startedRef.current = Date.now();
    setRunning((r) => !r);
  }

  function handleReset() {
    setRunning(false);
    setSecondsLeft(totalSecs);
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  // SVG circle params
  const R = 110;
  const CIRC = 2 * Math.PI * R;
  const dash = (progress / 100) * CIRC;

  return (
    <div className="timer-page">
      <div className="page-header">
        <h1>Focus Timer</h1>
        <p>Pomodoro technique — 25 min deep work, then a break</p>
      </div>

      <div className="timer-layout">
        {/* Left: timer */}
        <div className="timer-main card">
          {/* Mode switcher */}
          <div className="mode-tabs">
            {MODES.map((m, i) => (
              <button
                key={m.key}
                className={`mode-tab ${modeIdx === i ? "active" : ""}`}
                onClick={() => switchMode(i)}
                style={modeIdx === i ? { "--tab-color": m.color } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Clock face */}
          <div className="clock-wrap">
            <svg className="clock-svg" viewBox="0 0 260 260">
              {/* Track */}
              <circle cx="130" cy="130" r={R} stroke="var(--border)" strokeWidth="8" fill="none" />
              {/* Progress arc */}
              <circle
                cx="130" cy="130" r={R}
                stroke={mode.color}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${CIRC}`}
                transform="rotate(-90 130 130)"
                style={{ transition: running ? "stroke-dasharray 1s linear" : "none", filter: `drop-shadow(0 0 6px ${mode.color}66)` }}
              />
            </svg>

            <div className="clock-display">
              <div className="clock-time" style={{ color: mode.color }}>
                {mins}<span className="colon">:</span>{secs}
              </div>
              <div className="clock-mode">{mode.label}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="timer-controls">
            <button className="btn btn-ghost" onClick={handleReset}>↺ Reset</button>
            <button
              className="start-btn"
              onClick={handleStartStop}
              style={{ "--btn-color": mode.color }}
            >
              {running ? "⏸ Pause" : "▶ Start"}
            </button>
          </div>

          {/* Task + subject */}
          <div className="timer-meta">
            <div className="form-group">
              <label>What are you working on?</label>
              <input
                value={taskLabel}
                onChange={(e) => setTaskLabel(e.target.value)}
                placeholder="e.g. Gradient descent implementation"
                disabled={running}
              />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={running}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Right: stats */}
        <div className="timer-sidebar">
          <div className="card session-stats">
            <h3>Today's Focus</h3>
            <div className="focus-big">
              <span className="focus-num" style={{ color: "var(--accent)" }}>
                {todayData ? todayData.totalMinutes : 0}
              </span>
              <span className="focus-unit">min</span>
            </div>
            <div className="focus-bar-wrap">
              <div className="focus-bar-bg">
                <div
                  className="focus-bar-fill"
                  style={{ width: `${todayData ? todayData.progressPct : 0}%` }}
                />
              </div>
              <span className="focus-bar-label">{todayData ? todayData.progressPct : 0}% of daily goal</span>
            </div>
            <div className="sessions-today">
              <span>{todayData ? todayData.totalSessions : 0}</span> sessions completed
            </div>
          </div>

          <div className="card tips-card">
            <h3>Focus Tips</h3>
            <ul className="tips-list">
              <li>📵 Put your phone face-down</li>
              <li>🎧 Use lo-fi or white noise</li>
              <li>💧 Keep water at your desk</li>
              <li>📖 Review notes before starting</li>
              <li>🔁 After 4 sessions, take a long break</li>
            </ul>
          </div>

          {sessionCount > 0 && (
            <div className="card session-done-card">
              <div className="session-done-icon">🎯</div>
              <div>
                <div className="session-done-num">{sessionCount}</div>
                <div className="session-done-label">session{sessionCount !== 1 ? "s" : ""} this run</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
