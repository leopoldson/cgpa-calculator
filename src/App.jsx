import { useState } from "react";

const GRADE_SYSTEMS = {
  "4.0": {
    points: [4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.0],
    labels: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"],
  },
  "5.0": {
    points: [5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.0],
    labels: ["A", "B+", "B", "C+", "C", "D+", "D", "E", "F+", "F"],
  },
};

const HONOR_ROLLS = {
  "4.0": [
    { min: 3.7, label: "First Class Honours", color: "#22c55e" },
    { min: 3.0, label: "Second Class Upper", color: "#3b82f6" },
    { min: 2.0, label: "Second Class Lower", color: "#f59e0b" },
    { min: 1.0, label: "Third Class", color: "#f97316" },
    { min: 0, label: "Fail", color: "#ef4444" },
  ],
  "5.0": [
    { min: 4.5, label: "First Class Honours", color: "#22c55e" },
    { min: 3.5, label: "Second Class Upper", color: "#3b82f6" },
    { min: 2.5, label: "Second Class Lower", color: "#f59e0b" },
    { min: 1.5, label: "Third Class", color: "#f97316" },
    { min: 0, label: "Fail", color: "#ef4444" },
  ],
};

function getHonor(cgpa, system) {
  const rolls = HONOR_ROLLS[system];
  for (const r of rolls) {
    if (cgpa >= r.min) return r;
  }
  return rolls[rolls.length - 1];
}

// ── Screens ──────────────────────────────────────────────────────────────────

function SplashScreen({ onNext }) {
  return (
    <div style={styles.screen}>
      <div style={styles.splashBg} />
      <div style={styles.splashContent}>
        <div style={styles.splashIcon}>🎓</div>
        <h1 style={styles.splashTitle}>CGPA Calculator</h1>
        <p style={styles.splashSub}>
          developed by Leo ⭐
        </p>
        <button style={styles.splashBtn} onClick={onNext}>
          Get Started
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ onCalculate }) {
  return (
    <div style={styles.screen}>
      <div style={styles.homeTop}>
        <div style={styles.homeIconWrap}>
          <span style={{ fontSize: 48 }}>📊</span>
        </div>
        <h2 style={styles.homeTitle}>Know Your Standing</h2>
        <p style={styles.homeSub}>
          Add your courses, grades, and units — we'll crunch your CGPA instantly.
        </p>
      </div>
      <div style={styles.homeBottom}>
        <button style={styles.primaryBtn} onClick={onCalculate}>
          Calculate Your CGPA
        </button>
        <p style={styles.homeHint}>Supports both 4.0 and 5.0 grading systems</p>
      </div>
    </div>
  );
}

function CalculatorScreen({ onBack }) {
  const [step, setStep] = useState("system"); // system | entry | result
  const [system, setSystem] = useState(null);
  const [courses, setCourses] = useState([]);
  const [current, setCurrent] = useState({ code: "", title: "", units: "", grade: null });
  const [entryStep, setEntryStep] = useState("code"); // code | title | units | grade
  const [result, setResult] = useState(null);

  const gradeSystem = system ? GRADE_SYSTEMS[system] : null;

  function handleSystemSelect(s) {
    setSystem(s);
    setStep("entry");
    setEntryStep("code");
  }

  function handleCodeNext() {
    if (!current.code.trim()) return;
    setEntryStep("title");
  }

  function handleTitleNext(skip = false) {
    setCurrent((c) => ({ ...c, title: skip ? "" : c.title }));
    setEntryStep("units");
  }

  function handleUnitsNext() {
    const u = parseInt(current.units);
    if (!u || u < 1 || u > 6) return;
    setEntryStep("grade");
  }

  function handleGradeSelect(g) {
    const newCourse = { ...current, grade: g };
    setCurrent((c) => ({ ...c, grade: g }));
    // small delay so user sees the selection before moving on
    setTimeout(() => {
      setCourses((prev) => [...prev, newCourse]);
      setCurrent({ code: "", title: "", units: "", grade: null });
      setEntryStep("code");
    }, 300);
  }

  function handleCalculate() {
    if (courses.length === 0) return;
    let totalPoints = 0;
    let totalUnits = 0;
    for (const c of courses) {
      const units = parseInt(c.units);
      totalPoints += c.grade * units;
      totalUnits += units;
    }
    const cgpa = totalUnits > 0 ? totalPoints / totalUnits : 0;
    setResult({ cgpa: cgpa.toFixed(2), totalUnits, courses });
    setStep("result");
  }

  function handleReset() {
    setCourses([]);
    setCurrent({ code: "", title: "", units: "", grade: null });
    setSystem(null);
    setEntryStep("code");
    setResult(null);
    setStep("system");
  }

  // ── System picker ──
  if (step === "system") {
    return (
      <div style={styles.screen}>
        <TopBar title="" onBack={onBack} />
        <div style={styles.body}>
          {/* Hero text */}
          <div style={{ marginBottom: 36, marginTop: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", letterSpacing: 0.5, textTransform: "uppercase", margin: "0 0 8px" }}>Step 1 of 1</p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 8px", lineHeight: 1.2 }}>Which grading system does your school use?</h2>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>Your CGPA will be calculated based on this scale.</p>
          </div>

          {/* Side-by-side scale cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { s: "4.0", desc: "Used by most private universities", grades: ["A", "B", "C", "D", "F"] },
              { s: "5.0", desc: "Common in Nigerian public universities", grades: ["A", "B", "C", "D", "E", "F"] },
            ].map(({ s, desc, grades }) => (
              <button
                key={s}
                onClick={() => handleSystemSelect(s)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  background: "#f9fafb",
                  border: "2px solid #e5e7eb",
                  borderRadius: 20,
                  padding: "20px 16px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  gap: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ fontSize: 28, fontWeight: 800, color: "#111827", letterSpacing: -1 }}>{s}</span>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{desc}</p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                  {grades.map(g => (
                    <span key={g} style={{ fontSize: 11, fontWeight: 700, color: "#374151", background: "#e5e7eb", borderRadius: 5, padding: "1px 6px" }}>{g}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Course entry ──
  if (step === "entry") {
    return (
      <div style={styles.screen}>
        <TopBar
          title={`Course ${courses.length + 1}`}
          onBack={courses.length > 0 ? () => {
            setCourses((c) => c.slice(0, -1));
            setEntryStep("code");
          } : () => setStep("system")}
        />
        <div style={styles.body}>
          {/* Progress chips */}
          <div style={styles.chips}>
            {["code", "title", "units", "grade"].map((s, i) => (
              <div key={s} style={{
                ...styles.chip,
                background: entryStep === s ? "#6366f1" : i < ["code","title","units","grade"].indexOf(entryStep) ? "#22c55e" : "#e5e7eb",
                color: entryStep === s || i < ["code","title","units","grade"].indexOf(entryStep) ? "#fff" : "#9ca3af",
              }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
            ))}
          </div>

          {entryStep === "code" && (
            <EntryField
              label="Course Code"
              placeholder="e.g. CSC 201"
              value={current.code}
              onChange={(v) => setCurrent((c) => ({ ...c, code: v }))}
              onNext={handleCodeNext}
            />
          )}

          {entryStep === "title" && (
            <EntryField
              label="Course Title"
              placeholder="e.g. Data Structures"
              value={current.title}
              onChange={(v) => setCurrent((c) => ({ ...c, title: v }))}
              onNext={() => handleTitleNext(false)}
              onSkip={() => handleTitleNext(true)}
              skipLabel="Skip"
            />
          )}

          {entryStep === "units" && (
            <EntryField
              label="Credit Units"
              placeholder="e.g. 3"
              value={current.units}
              onChange={(v) => setCurrent((c) => ({ ...c, units: v }))}
              onNext={handleUnitsNext}
              numeric
            />
          )}

          {entryStep === "grade" && (
            <div>
              <p style={styles.prompt}>Select Grade Point</p>
              <div style={styles.gradeGrid}>
                {gradeSystem.labels.map((label, i) => (
                  <button
                    key={i}
                    style={{
                      ...styles.gradeBtn,
                      background: current.grade === gradeSystem.points[i] ? "#6366f1" : "#f3f4f6",
                      color: current.grade === gradeSystem.points[i] ? "#fff" : "#374151",
                    }}
                    onClick={() => handleGradeSelect(gradeSystem.points[i])}
                  >
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{label}</span>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>{gradeSystem.points[i]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Course list */}
          {courses.length > 0 && (
            <div style={styles.courseList}>
              <p style={styles.courseListTitle}>{courses.length} course{courses.length > 1 ? "s" : ""} added</p>
              {courses.map((c, i) => (
                <div key={i} style={styles.courseRow}>
                  <span style={styles.courseCode}>{c.code}</span>
                  <span style={styles.courseUnits}>{c.units} units</span>
                  <span style={styles.courseGrade}>{c.grade} GP</span>
                </div>
              ))}
              <button style={styles.calcBtn} onClick={handleCalculate}>
                Calculate CGPA →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Result ──
  if (step === "result") {
    const honor = getHonor(parseFloat(result.cgpa), system);
    return (
      <div style={styles.screen}>
        <TopBar title="Your Result" onBack={handleReset} backLabel="Start Over" />
        <div style={styles.body}>

          {/* Locked result card */}
          <div style={{ position: "relative" }}>
            <div className="blurred" style={{ ...styles.resultCard, borderColor: honor.color }}>
              <p style={styles.resultLabel}>Your CGPA</p>
              <p style={{ ...styles.resultCGPA, color: honor.color }}>{result.cgpa}</p>
              <p style={{ ...styles.resultHonor, color: honor.color }}>{honor.label}</p>
              <p style={styles.resultMeta}>{system} Scale · {result.totalUnits} Total Units</p>
            </div>
            <div className="lock-overlay">
              <span className="lock-icon">🔒</span>
              <p className="lock-title">Your result is ready</p>
              <p className="lock-sub">This is a demo version. Contact the developer to get the full app with your results unlocked.</p>
              <button className="lock-btn" onClick={() => window.open("https://wa.link/u1i8nq", "_blank")}>
                Contact the Developer
              </button>
            </div>
          </div>

          {/* Locked breakdown */}
          <div style={{ position: "relative", marginTop: 8 }}>
            <div className="blurred">
              <div style={styles.breakdownHeader}>Course Breakdown</div>
              {result.courses.map((c, i) => (
                <div key={i} style={styles.breakdownRow}>
                  <div>
                    <span style={styles.bCode}>{c.code}</span>
                    {c.title && <span style={styles.bTitle}> — {c.title}</span>}
                  </div>
                  <span style={styles.bGrade}>{c.grade} pts × {c.units} units</span>
                </div>
              ))}
            </div>
          </div>

          <button style={styles.homeBtn} onClick={onBack}>← Back to Home</button>
        </div>
      </div>
    );
  }
}

function TopBar({ title, onBack, backLabel = "Back" }) {
  return (
    <div style={styles.topBar}>
      <button style={styles.backBtn} onClick={onBack}>‹ {backLabel}</button>
      <span style={styles.topBarTitle}>{title}</span>
      <span style={{ minWidth: 64, maxWidth: 120 }} />
    </div>
  );
}

function EntryField({ label, placeholder, value, onChange, onNext, onSkip, skipLabel, numeric }) {
  return (
    <div>
      <p style={styles.prompt}>{label}</p>
      <input
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={numeric ? "numeric" : "text"}
        onKeyDown={(e) => e.key === "Enter" && onNext()}
        autoFocus
      />
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button style={styles.nextBtn} onClick={onNext}>Next →</button>
        {onSkip && (
          <button style={styles.skipBtn} onClick={onSkip}>{skipLabel || "Skip"}</button>
        )}
      </div>
    </div>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("splash");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&display=swap');
        html, body { margin: 0; padding: 0; font-family: 'Geist', sans-serif; }
        *, *::before, *::after { box-sizing: border-box; font-family: inherit; }
        .blurred { filter: blur(10px); user-select: none; pointer-events: none; }
        .lock-overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(2px);
          z-index: 10; gap: 10px; padding: 24px; text-align: center;
        }
        .lock-icon { font-size: 36px; }
        .lock-title { font-size: 17px; font-weight: 700; color: #111827; margin: 0; }
        .lock-sub { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }
        .lock-btn {
          margin-top: 6px;
          background: #111827; color: #fff;
          border: none; border-radius: 12px;
          padding: 12px 28px; font-size: 14px;
          font-weight: 600; cursor: pointer;
          font-family: inherit;
        }
        .app-shell {
          min-height: 100vh;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Geist', sans-serif;
          box-sizing: border-box;
        }
        .app-inner {
          width: 100%;
          max-width: 480px;
          min-height: 720px;
          background: #fff;
          border-radius: 36px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        @media (max-width: 520px) {
          .app-shell {
            padding: 0;
            background: #fff;
            align-items: stretch;
          }
          .app-inner {
            max-width: 100%;
            min-height: 100vh;
            border-radius: 0;
            box-shadow: none;
          }
        }
      `}</style>
      <div className="app-shell">
        <div className="app-inner">
          {screen === "splash" && <SplashScreen onNext={() => setScreen("home")} />}
          {screen === "home" && <HomeScreen onCalculate={() => setScreen("calc")} />}
          {screen === "calc" && <CalculatorScreen onBack={() => setScreen("home")} />}
        </div>
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  screen: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 720,
  },
  // Splash
  splashBg: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 50%, #0ea5e9 100%)",
    zIndex: 0,
  },
  splashContent: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    textAlign: "center",
  },
  splashIcon: { fontSize: 64, marginBottom: 20 },
  splashTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: "#fff",
    margin: 0,
    letterSpacing: -0.5,
  },
  splashSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    marginTop: 12,
    lineHeight: 1.6,
  },
  splashBtn: {
    marginTop: 48,
    background: "#fff",
    color: "#4f46e5",
    border: "none",
    borderRadius: 14,
    padding: "14px 40px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  // Home
  homeTop: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px 20px",
    textAlign: "center",
  },
  homeIconWrap: {
    width: 96,
    height: 96,
    background: "#ede9fe",
    borderRadius: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  homeTitle: { fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0 },
  homeSub: { color: "#6b7280", fontSize: 15, marginTop: 10, lineHeight: 1.6 },
  homeBottom: {
    padding: "24px 32px 48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "16px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  homeHint: { textAlign: "center", color: "#9ca3af", fontSize: 13, margin: 0 },
  // Shared body
  body: {
    flex: 1,
    padding: "20px 24px 32px",
    overflowY: "auto",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 16px 0",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: 12,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#6366f1",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    padding: "4px 8px",
    minWidth: 64,
    maxWidth: 120,
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  topBarTitle: { fontWeight: 700, fontSize: 16, color: "#111827" },
  // System
  systemCard: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f9fafb",
    border: "2px solid #e5e7eb",
    borderRadius: 14,
    padding: "18px 20px",
    marginBottom: 12,
    cursor: "pointer",
    fontSize: 16,
    transition: "border-color 0.2s",
  },
  systemLabel: { fontWeight: 700, color: "#1e1b4b" },
  systemArrow: { color: "#6366f1", fontSize: 20 },
  // Entry
  chips: { display: "flex", gap: 8, marginBottom: 24 },
  chip: {
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  prompt: { fontWeight: 700, fontSize: 17, color: "#111827", marginBottom: 12, marginTop: 0 },
  input: {
    width: "100%",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
    color: "#111827",
    background: "#f9fafb",
  },
  nextBtn: {
    flex: 1,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  skipBtn: {
    background: "#f3f4f6",
    color: "#6b7280",
    border: "none",
    borderRadius: 12,
    padding: "13px 20px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  // Grade grid
  gradeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  gradeBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    border: "none",
    borderRadius: 12,
    padding: "14px 8px",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  // Course list
  courseList: { marginTop: 28 },
  courseListTitle: { fontWeight: 700, color: "#374151", fontSize: 13, marginBottom: 8 },
  courseRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "#f9fafb",
    borderRadius: 8,
    marginBottom: 6,
    fontSize: 13,
  },
  courseCode: { fontWeight: 700, color: "#4f46e5" },
  courseUnits: { color: "#6b7280" },
  courseGrade: { fontWeight: 600, color: "#374151" },
  calcBtn: {
    width: "100%",
    marginTop: 14,
    background: "linear-gradient(135deg, #059669, #0d9488)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  // Result
  resultCard: {
    border: "3px solid",
    borderRadius: 20,
    padding: "28px 24px",
    textAlign: "center",
    marginBottom: 24,
    background: "#fafafa",
  },
  resultLabel: { color: "#6b7280", fontSize: 14, fontWeight: 600, margin: 0 },
  resultCGPA: { fontSize: 56, fontWeight: 900, margin: "8px 0 4px", letterSpacing: -2 },
  resultHonor: { fontSize: 17, fontWeight: 700, margin: 0 },
  resultMeta: { color: "#9ca3af", fontSize: 13, marginTop: 6 },
  breakdownHeader: { fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
  },
  bCode: { fontWeight: 700, color: "#4f46e5" },
  bTitle: { color: "#6b7280" },
  bGrade: { fontWeight: 600, color: "#374151", whiteSpace: "nowrap" },
  homeBtn: {
    marginTop: 24,
    width: "100%",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};
