# GPA Calculator

A fast, single-page GPA calculator built for Nigerian university students — supports both 4.0 and 5.0 grading scales with automatic honor classification, and an optional running CGPA calculation.

**Live demo:** [cgpa-calculator-five-theta.vercel.app](https://gpa-calculator-leopold.vercel.app)

> Note: named "GPA" rather than "CGPA" at the project level — cumulative GPA (CGPA) implies credit-weighted averaging across a student's full academic history, which this tool approximates rather than tracks exactly (see "How CGPA is calculated" below). The core per-semester result is a straightforward GPA computed from the courses, grades, and units you enter.

## Features

- **Dual grading scales** — pick between 4.0 and 5.0 systems, each mapped to the correct honor classifications (First Class, Second Class Upper, etc.)
- **Optional CGPA tracking** — enter your current CGPA and semesters completed so far, and the app folds this semester in to show an updated CGPA alongside your GPA
- **Multi-step calculator flow** — add courses with grade and unit, get a live-updating GPA as you go
- **Results Breakdown table** — per-course grade point, credit units, and letter grade laid out in a clean, discrete table, with credits registered vs. credits earned tracked separately (a failed course doesn't earn its credits, matching how real transcripts work)
- **Multi-format export** — download a full result slip as PDF, CSV, XLS, or JSON via a share menu, including a per-course breakdown, GPA/CGPA summary, and generation date. The PDF is centered and formatted like an official result slip.
- **App-like responsive layout** — a fixed-frame card that adapts from a full-bleed mobile view to a wider, centered desktop card with its own backdrop treatment; content that overflows the viewport scrolls inside the card itself, so the layout never gets visually cut off on shorter screens
- **Clean, custom UI** — line-style SVG icons, restrained indigo/violet color language, Geist font, consistent focus states throughout

## Tech Stack

- **React** (Vite)
- **jsPDF** + **jspdf-autotable** — structured, centered PDF export
- **SheetJS (xlsx)** — Excel export
- Vanilla CSS-in-JS styling (no framework dependency)

## Getting Started

```bash
git clone https://github.com/leopoldson/gpa-calculator.git
cd gpa-calculator
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## How It Works

1. Choose your grading scale (4.0 or 5.0)
2. Optionally add your current CGPA and semesters completed
3. Add each course with its grade and unit value
4. GPA is calculated as total grade points ÷ total units for the semester
5. If CGPA tracking is enabled, an updated CGPA is calculated (see below)
6. Result is matched against the honor classification table for your chosen scale, with your GPA shown as an actual figure over your scale (e.g. `4.21/5.0`) directly under your honor classification
7. Export your full result breakdown in your preferred format

## How CGPA is calculated

```
newCGPA = (prevCGPA × prevSemesters + thisSemesterGPA) / (prevSemesters + 1)
```

This is a **semester-weighted average**, not a true credit-weighted cumulative average — it assumes each completed semester carries roughly equal weight. A fully accurate CGPA would require the total grade points and total units earned across every past semester, which this tool doesn't collect (by design, to keep entry to two numbers). This is a documented simplification, not a bug.

## Roadmap

- [ ] Full unit-weighted CGPA using historical per-semester grade points and units, for exact cumulative accuracy
- [ ] Save/load course lists locally

## License

This project is licensed under the MIT License — a permissive open-source license meaning anyone can use, copy, modify, and distribute this code (including commercially), as long as the original copyright notice is retained. See the [MIT License](https://opensource.org/license/mit) for full terms.
