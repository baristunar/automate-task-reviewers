import { CSV_HEADER_SP, CSV_HEADER_TASK_ID, CSV_HEADER_TASK_NAME } from "../config/index.js";
import {
  csvEscape,
  downloadTextAsFile,
  formatDateForFileName,
  normalizeHeader,
  parseCsv,
} from "../utils/index.js";

export function exportTasksToCsv(state) {
  const maxReviewerCount = state.tasks.reduce(
    (maxCount, task) => Math.max(maxCount, task.reviewers.length),
    0,
  );

  const headers = ["Task ID", "Task Name", "SP"];
  for (let i = 1; i <= maxReviewerCount; i += 1) {
    headers.push(`Reviewer ${i}`);
  }

  const rows = [headers];

  for (const task of state.tasks) {
    const reviewerNames = task.reviewers
      .map((reviewerId) => state.reviewers.find((reviewer) => reviewer.id === reviewerId)?.name)
      .filter(Boolean);

    const row = [task.taskCode || "", task.title, String(task.storyPoints)];

    for (let i = 0; i < maxReviewerCount; i += 1) {
      row.push(reviewerNames[i] || "");
    }

    rows.push(row);
  }

  const csvContent = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const fileName = `task-review-list-${formatDateForFileName(new Date())}.csv`;
  downloadTextAsFile(`\uFEFF${csvContent}`, fileName, "text/csv;charset=utf-8;");
}

export function importTasksFromCsvText(text) {
  const rows = parseCsv(text);

  if (rows.length < 2) {
    return { error: "CSV is empty or has only a header row." };
  }

  const headerRow = rows[0].map((cell) => normalizeHeader(cell));
  const taskIdIndex = headerRow.indexOf(CSV_HEADER_TASK_ID);
  const taskNameIndex = headerRow.indexOf(CSV_HEADER_TASK_NAME);
  const spIndex = headerRow.indexOf(CSV_HEADER_SP);

  if (taskIdIndex === -1 || taskNameIndex === -1 || spIndex === -1) {
    const missingHeaders = [];
    if (taskIdIndex === -1) {
      missingHeaders.push("Task ID");
    }
    if (taskNameIndex === -1) {
      missingHeaders.push("Task Name");
    }
    if (spIndex === -1) {
      missingHeaders.push("SP");
    }

    return { error: `Missing columns: ${missingHeaders.join(", ")}` };
  }

  const tasks = [];
  let skippedCount = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const taskCode = String(row[taskIdIndex] || "").trim();
    const title = String(row[taskNameIndex] || "").trim();
    const pointsRaw = String(row[spIndex] || "").trim();
    const storyPoints = Number(pointsRaw.replace(",", "."));

    if (!taskCode || !title || !Number.isFinite(storyPoints) || storyPoints < 1) {
      skippedCount += 1;
      continue;
    }

    tasks.push({
      id: crypto.randomUUID(),
      taskCode,
      title,
      storyPoints,
      reviewers: [],
    });
  }

  if (!tasks.length) {
    return { error: "No valid rows found. Please verify the CSV columns." };
  }

  return {
    tasks,
    skippedCount,
  };
}
