import { STORAGE_KEY } from "../config.js";
import { state } from "./state.js";

export function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks.map((task) => ({
          id: task.id,
          taskCode: typeof task.taskCode === "string" ? task.taskCode : "",
          title: task.title,
          storyPoints: Number(task.storyPoints) || 0,
          reviewers: Array.isArray(task.reviewers) ? task.reviewers : [],
        }))
      : [];

    state.reviewers = Array.isArray(parsed.reviewers) ? parsed.reviewers : [];
  } catch (error) {
    console.error("State parse error:", error);
    localStorage.removeItem(STORAGE_KEY);
  }
}
