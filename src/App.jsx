import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

function getHonor(gpa, system) {
  const rolls = HONOR_ROLLS[system];
  for (const r of rolls) {
    if (gpa >= r.min) return r;
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
        <h1 style={styles.splashTitle}>GPA Calculator</h1>
        <p style={styles.splashSub}>
          Know your standing in seconds.
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
          <HomeGlyph />
        </div>
        <h2 style={styles.homeTitle}>Know Your Standing</h2>
        <p style={styles.homeSub}>
          Add your courses, grades, and units — we'll crunch your GPA instantly.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {["4.0 Scale", "5.0 Scale"].map((label) => (
            <span key={label} style={{
              background: "#f3f4f6",
              color: "#6b7280",
              borderRadius: 100,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
            }}>{label}</span>
          ))}
        </div>
      </div>

      <div style={styles.homeBottom}>
        <button style={styles.primaryBtn} onClick={onCalculate}>
          Calculate Your GPA
        </button>
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
  const [unitsError, setUnitsError] = useState(false);

  const gradeSystem = system ? GRADE_SYSTEMS[system] : null;
  const entrySteps = ["code", "title", "units", "grade"];

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
    if (!u || u < 1 || u > 5) {
      setUnitsError(true);
      return;
    }
    setEntryStep("grade");
  }

  function handleEntryBack() {
    const idx = entrySteps.indexOf(entryStep);
    if (idx > 0) {
      setEntryStep(entrySteps[idx - 1]);
    } else {
      if (courses.length > 0) {
        const prev = courses[courses.length - 1];
        setCourses((c) => c.slice(0, -1));
        setCurrent({ code: prev.code, title: prev.title, units: String(prev.units), grade: null });
        setEntryStep("grade");
      } else {
        setStep("system");
      }
    }
  }

  function handleGradeSelect(g) {
    const newCourse = { ...current, grade: g };
    setCurrent((c) => ({ ...c, grade: g }));
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
    const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;
    setResult({ gpa: gpa.toFixed(2), totalUnits, courses });
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
          <div style={{ marginBottom: 32, marginTop: 8 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 8px", lineHeight: 1.2 }}>Which grading system does your school use?</h2>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>Your GPA will be calculated based on this scale.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {["4.0", "5.0"].map((s) => (
              <button
                key={s}
                onClick={() => handleSystemSelect(s)}
                style={styles.systemBigCard}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(79,70,229,0.16)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)"; }}
              >
                {s}
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
          onBack={handleEntryBack}
        />
        <div style={styles.body}>
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
              onChange={(v) => { setCurrent((c) => ({ ...c, units: v })); setUnitsError(false); }}
              onNext={handleUnitsNext}
              numeric
            />
          )}

          {/* Units error modal */}
          {unitsError && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 999, padding: 24,
            }}>
              <div style={{
                background: "#fff", borderRadius: 20, padding: "28px 24px",
                maxWidth: 320, width: "100%", textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <p style={{ fontWeight: 800, fontSize: 17, color: "#111827", margin: "0 0 8px" }}>Invalid Credit Units</p>
                <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.5 }}>
                  Please enter a value between <strong>1 and 5</strong>.
                </p>
                <button
                  onClick={() => setUnitsError(false)}
                  style={{
                    background: "#4f46e5", color: "#fff", border: "none",
                    borderRadius: 12, padding: "12px 32px", fontSize: 15,
                    fontWeight: 700, cursor: "pointer", width: "100%",
                  }}
                >Got it</button>
              </div>
            </div>
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
                Calculate GPA →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Result ──
  if (step === "result") {
    const honor = getHonor(parseFloat(result.gpa), system);
    return (
      <div style={styles.screen}>
        <TopBar
          title="Your Result"
          onBack={handleReset}
          backLabel="Start Over"
          right={<ExportMenu result={result} system={system} honor={honor} />}
        />
        <div style={styles.body}>

          <div style={{ position: "relative" }}>
            <div style={{ ...styles.resultCard, borderColor: honor.color + "33" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: honor.color }} />
              <p style={styles.resultLabel}>Your GPA</p>
              <p style={{ ...styles.resultGPA, color: honor.color }}>{result.gpa}</p>
              <p style={{ ...styles.resultHonor, color: honor.color }}>{honor.label}</p>
              <p style={styles.resultMeta}>{system} Scale · {result.totalUnits} Total Units</p>
            </div>
          </div>

          <div style={{ position: "relative", marginTop: 8 }}>
            <div>
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

function exportAsPDF(result, system, honor) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("GPA Result", 14, 20);

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text(`GPA: ${result.gpa}  (${honor.label})`, 14, 40);
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text(`${system} Scale · ${result.totalUnits} Total Units`, 14, 47);

  autoTable(doc, {
    startY: 55,
    head: [["Course Code", "Title", "Units", "Grade Points"]],
    body: result.courses.map((c) => [
      c.code || "-",
      c.title || "-",
      String(c.units),
      String(c.grade),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [17, 24, 39] },
  });

  doc.save(`GPA-Result-${result.gpa}.pdf`);
}

function buildRows(result) {
  return result.courses.map((c) => ({
    "Course Code": c.code || "",
    "Title": c.title || "",
    "Units": c.units,
    "Grade Points": c.grade,
  }));
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportAsCSV(result, system, honor) {
  const rows = buildRows(result);
  const header = Object.keys(rows[0] || { "Course Code": "", "Title": "", "Units": "", "Grade Points": "" });
  const lines = [
    `GPA,${result.gpa}`,
    `Honor,${honor.label}`,
    `Scale,${system}`,
    `Total Units,${result.totalUnits}`,
    "",
    header.join(","),
    ...rows.map((r) => header.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")),
  ];
  downloadBlob(lines.join("\n"), `GPA-Result-${result.gpa}.csv`, "text/csv");
}

function exportAsXLSX(result, system, honor) {
  const rows = buildRows(result);
  const summary = [
    { Field: "GPA", Value: result.gpa },
    { Field: "Honor", Value: honor.label },
    { Field: "Scale", Value: system },
    { Field: "Total Units", Value: result.totalUnits },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Summary");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Courses");
  XLSX.writeFile(wb, `GPA-Result-${result.gpa}.xlsx`);
}

function exportAsJSON(result, system, honor) {
  const payload = {
    gpa: result.gpa,
    honor: honor.label,
    scale: system,
    totalUnits: result.totalUnits,
    generatedAt: new Date().toISOString(),
    courses: result.courses.map((c) => ({
      code: c.code,
      title: c.title || null,
      units: c.units,
      gradePoints: c.grade,
    })),
  };
  downloadBlob(JSON.stringify(payload, null, 2), `GPA-Result-${result.gpa}.json`, "application/json");
}

function TopBar({ title, onBack, backLabel = "Back", right }) {
  return (
    <div style={styles.topBar}>
      <button style={styles.backBtn} onClick={onBack}>‹ {backLabel}</button>
      <span style={styles.topBarTitle}>{title}</span>
      <div style={{ minWidth: 64, maxWidth: 120, display: "flex", justifyContent: "flex-end" }}>
        {right || null}
      </div>
    </div>
  );
}

// ── Export menu (iOS share-sheet style) ─────────────────────────────────────

function ExportMenu({ result, system, honor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const options = [
    { key: "pdf", label: "Export as PDF", icon: <FileIcon />, action: () => exportAsPDF(result, system, honor) },
    { key: "csv", label: "Export as CSV", icon: <TableIcon />, action: () => exportAsCSV(result, system, honor) },
    { key: "xlsx", label: "Export as XLS", icon: <GridIcon />, action: () => exportAsXLSX(result, system, honor) },
    { key: "json", label: "Export as JSON", icon: <BracesIcon />, action: () => exportAsJSON(result, system, honor) },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        style={styles.exportIconBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label="Export"
      >
        <ExportGlyph />
      </button>
      {open && (
        <div style={styles.exportMenu}>
          {options.map((o) => (
            <button
              key={o.key}
              style={styles.exportMenuItem}
              onClick={() => { o.action(); setOpen(false); }}
            >
              <span style={{ width: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>{o.icon}</span>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ExportGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v11" />
      <path d="M8 6l4-4 4 4" />
      <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 15h6" />
      <path d="M9 11h6" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M9 10v10" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M3 15h18" />
      <path d="M9 4v16" />
      <path d="M15 4v16" />
    </svg>
  );
}

function BracesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2" />
      <path d="M16 3a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2" />
    </svg>
  );
}

function HomeGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16l4-5 3 3 5-7" />
      <circle cx="19" cy="7" r="1.4" fill="#4f46e5" stroke="none" />
    </svg>
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
        onFocus={(e) => { e.target.style.borderColor = "#4f46e5"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 4px rgba(79,70,229,0.1)"; }}
        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; e.target.style.boxShadow = "none"; }}
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
    padding: "24px 32px 36px",
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
  systemBigCard: {
    aspectRatio: "1 / 1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    border: "2px solid #e5e7eb",
    borderRadius: 24,
    fontSize: 40,
    fontWeight: 900,
    color: "#111827",
    letterSpacing: -1.5,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
    fontVariantNumeric: "tabular-nums",
  },
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
    transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
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
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: "0 4px 14px rgba(79,70,229,0.25)",
  },
  // Result
  resultCard: {
    position: "relative",
    overflow: "hidden",
    border: "1.5px solid",
    borderRadius: 22,
    padding: "32px 24px",
    textAlign: "center",
    marginBottom: 28,
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(17,24,39,0.12)",
  },
  resultLabel: { color: "#9ca3af", fontSize: 12, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: 0.8 },
  resultGPA: { fontSize: 60, fontWeight: 900, margin: "10px 0 4px", letterSpacing: -2.5, fontVariantNumeric: "tabular-nums" },
  resultHonor: { fontSize: 16, fontWeight: 700, margin: 0 },
  resultMeta: { color: "#9ca3af", fontSize: 13, marginTop: 10 },
  breakdownHeader: { fontWeight: 700, fontSize: 12, color: "#9ca3af", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 4px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
  },
  bCode: { fontWeight: 700, color: "#111827" },
  bTitle: { color: "#9ca3af" },
  bGrade: { fontWeight: 600, color: "#4f46e5", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" },
  exportIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  exportMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
    padding: 6,
    minWidth: 176,
    zIndex: 50,
  },
  exportMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    background: "none",
    border: "none",
    borderRadius: 9,
    padding: "10px 10px",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    cursor: "pointer",
    textAlign: "left",
  },
  homeBtn: {
    marginTop: 10,
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
