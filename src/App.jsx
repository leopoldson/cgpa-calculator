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
          Developed by <strong>Favour Leopold</strong>
          <br />
          <span style={styles.splashClass}>Computer Science · OOU</span>
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
        <TopBar title="Select GPA System" onBack={onBack} />
        <div style={styles.body}>
          <p style={styles.prompt}>Which grading system does your school use?</p>
          {["4.0", "5.0"].map((s) => (
            <button key={s} style={styles.systemCard} onClick={() => handleSystemSelect(s)}>
              <span style={styles.systemLabel}>{s} Scale</span>
              <span style={styles.systemArrow}>→</span>
            </button>
          ))}
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
          <div style={{ ...styles.resultCard, borderColor: honor.color }}>
            <p style={styles.resultLabel}>Your CGPA</p>
            <p style={{ ...styles.resultCGPA, color: honor.color }}>{result.cgpa}</p>
            <p style={{ ...styles.resultHonor, color: honor.color }}>{honor.label}</p>
            <p style={styles.resultMeta}>{system} Scale · {result.totalUnits} Total Units</p>
          </div>

          <div style={styles.breakdownHeader}>Course Breakdown</div>
          {result.courses.map((c, i) => (
            <div key={i} style={styles.breakdownRow}>
              <div>
                <span style={styles.bCode}>{c.code}</span>
                {c.title && <span style={styles.bTitle}> — {c.title}</span>}
              </div>
              <span style={styles.bGrade}>{c.grade} × {c.units}u</span>
            </div>
          ))}

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
      <span style={{ width: 64 }} />
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
    <div style={styles.phone}>
      <div style={styles.phoneInner}>
        {screen === "splash" && <SplashScreen onNext={() => setScreen("home")} />}
        {screen === "home" && <HomeScreen onCalculate={() => setScreen("calc")} />}
        {screen === "calc" && <CalculatorScreen onBack={() => setScreen("home")} />}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  phone: {
    minHeight: "100vh",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  phoneInner: {
    width: "100%",
    maxWidth: 390,
    minHeight: 720,
    background: "#fff",
    borderRadius: 36,
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
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
  splashClass: { fontSize: 13, opacity: 0.7 },
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
    width: 80,
    textAlign: "left",
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
