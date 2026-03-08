# Sprint Reviewer Distributor

Lightweight frontend tool to distribute task reviewers fairly based on story points.

It is designed for sprint planning/review workflows where:

- each task can have multiple reviewers,
- assignment load should stay balanced,
- CSV import/export is required for spreadsheet-driven teams.

## What It Does

- Create, edit, and delete tasks
- Add and remove reviewers manually
- Import tasks from CSV with strict schema (`Task ID`, `Task Name`, `SP`)
- Export tasks to CSV with dynamic reviewer columns (`Reviewer 1..N`)
- Auto-assign reviewers using point-based balancing
- Manually override reviewers on any task
- Clear all tasks and clear all reviewers with modern confirmation modals
- Persist all data in browser `localStorage`

## Tech Stack

- Vite (dev server and production build)
- Vanilla JavaScript (ES modules)
- HTML + CSS
- ESLint + Prettier
- Husky (pre-commit quality checks)

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Start development server.

```bash
npm run dev
```

3. Open:

`http://localhost:4173`

## NPM Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Create production build in `dist/`
- `npm run preview`: Preview production build locally
- `npm run check`: Syntax checks for entry files
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Auto-fix lint issues
- `npm run format`: Format files with Prettier
- `npm run format:check`: Verify formatting without writing

## CSV Rules

### Import

- Only `.csv` files are accepted
- Required headers:
- `Task ID`
- `Task Name`
- `SP`
- Rows with missing/invalid required values are skipped
- `SP` must be numeric and `>= 1`

### Export

- Always includes base columns:
- `Task ID`, `Task Name`, `SP`
- Adds dynamic reviewer columns based on current max reviewer count:
- `Reviewer 1`, `Reviewer 2`, ...

## Reviewer Assignment Behavior

- **Auto assignment** requires at least 2 reviewers in the pool
- Auto assignment clears existing task reviewer assignments before recalculating
- **Manual assignment** allows selecting one or more reviewers
- Reviewer removals are reflected on all tasks immediately

## Project Structure

- `src/index.html`: App shell and modal markup
- `src/styles.css`: Design system and component styling
- `src/bootstrap.js`: Thin bootstrap entry (`src/main.js` import)
- `src/main.js`: App orchestration and event handlers
- `src/config/index.js`: Constants and app-level config
- `src/utils/index.js`: Generic utility functions
- `src/app/dom.js`: DOM element map
- `src/app/state.js`: Runtime state and state helpers
- `src/app/render.js`: UI rendering
- `src/app/storage.js`: `localStorage` persistence
- `src/app/csv.js`: CSV import/export logic
- `src/app/assignment.js`: Auto-assignment algorithm
- `src/app/modal.js`: Reusable confirm modal logic
- `src/app/notifications.js`: Toast notifications
- `vite.config.js`: Vite configuration
- `vercel.json`: Vercel deploy/runtime headers

## Code Quality Workflow

Husky is configured with a `pre-commit` hook that runs:

- `npm run lint`
- `npm run format:check`
- `npm run check`

This prevents commits with obvious quality or syntax regressions.

## Deployment

Live URL: `https://automate-task-reviewers.vercel.app/`

## Contribution

1. Fork the repository and create a feature branch.
2. Install dependencies with `npm install`.
3. Run checks before commit:

- `npm run check`
- `npm run lint`
- `npm run format:check`

4. Open a pull request with a clear summary and screenshots (if UI changed).

## Notes

- Data is stored in the browser (`localStorage`).
- If multiple teammates need to share the same board in real time, add a backend (for example Supabase/Firebase) in a future iteration.
