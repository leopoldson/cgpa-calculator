# GPA Calculator

A fast, single-page GPA calculator built for Nigerian university students — supports both 4.0 and 5.0 grading scales with automatic honor classification.

**Live demo:** [cgpa-calculator-five-theta.vercel.app](https://cgpa-calculator-five-theta.vercel.app)

> Note: named "GPA" rather than "CGPA" — a cumulative GPA (CGPA) implies credit-weighted averaging across semesters, which this tool doesn't do. It computes a straightforward GPA from the courses, grades, and units you enter in a single pass.

## Features

- **Dual grading scales** — pick between 4.0 and 5.0 systems, each mapped to the correct honor classifications (First Class, Second Class Upper, etc.)
- **Multi-step calculator flow** — add courses with grade and unit, get a live-updating GPA as you go
- **Multi-format export** — download your result as PDF, CSV, XLS, or JSON via a share menu
- **Clean, custom UI** — line-style SVG icons, restrained indigo/violet color language, Geist font, consistent focus states throughout

## Tech Stack

- **React** (Vite)
- **jsPDF** — PDF export
- **SheetJS (xlsx)** — Excel export
- Vanilla CSS-in-JS styling (no framework dependency)

## Getting Started

```bash
git clone https://github.com/leopoldson/cgpa-calculator.git
cd cgpa-calculator
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## How It Works

1. Choose your grading scale (4.0 or 5.0)
2. Add each course with its grade and unit value
3. GPA is calculated as total grade points ÷ total units
4. Result is matched against the honor classification table for your chosen scale
5. Export your result in your preferred format

## Roadmap

- [ ] Semester-by-semester tracking for true CGPA (credit-weighted cumulative) support
- [ ] Save/load course lists locally

## License

MIT
