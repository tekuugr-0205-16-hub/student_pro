import { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import Assignments from "./components/Assignments/Assignments";
import Pomodoro from "./components/Pomodoro/Pomodoro";
import Grades from "./components/Grades/Grades";
import Notes from "./components/Notes/Notes";
import Sidebar from "./components/Sidebar";
import { AppProvider } from "./context/AppContext";
import "./styles.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard setActivePage={setActivePage} />,
    assignments: <Assignments />,
    pomodoro: <Pomodoro />,
    grades: <Grades />,
    notes: <Notes />,
  };

  return (
    <AppProvider>
      <div className="app-shell">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="main-content">
          <div className="page-wrapper">
            {pages[activePage]}
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
