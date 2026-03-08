# Sprint Reviewer Distributor

A static frontend app for managing balanced task review assignments based on story points.

## Features

- Add, edit, and delete tasks
- CSV import (`Task ID`, `Task Name`, `SP`)
- CSV export with dynamic columns (`Reviewer 1..N`)
- Automatic reviewer assignment (minimum 2 reviewers per task)
- Manual reviewer editing per task
- Local persistence with `localStorage`

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Then open `http://localhost:4173`.

Production build:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

Syntax check:

```bash
npm run check
```

## Deploy to Vercel

1. Push the project to a GitHub repository.
2. In Vercel, go to `Add New...` > `Project`.
3. Select and connect your repository.
4. Choose `Other` as the framework preset.
5. Set build command to `npm run build`.
6. Set output directory to `dist`.
7. Click `Deploy`.

## Project Structure

- `index.html`: Main page
- `styles.css`: UI styles
- `app.js`: Thin bootstrap entry file
- `src/main.js`: Main application orchestration
- `src/app/*`: Feature modules (state, rendering, storage, csv, assignment, dom)
- `src/config.js`: Shared constants
- `src/utils.js`: Common utility functions
- `vite.config.js`: Vite configuration
- `vercel.json`: Vercel production configuration
