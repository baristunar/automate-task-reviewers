import { MIN_REVIEWERS_PER_TASK } from "./config/index.js";
import { exportTasksToCsv, importTasksFromCsvText } from "./app/csv.js";
import { el } from "./app/dom.js";
import { confirmAction } from "./app/modal.js";
import { toast } from "./app/notifications.js";
import { renderApp } from "./app/render.js";
import { state, uiState, sortTasksByPoints } from "./app/state.js";
import { loadState, persistState } from "./app/storage.js";
import { autoAssignReviewers } from "./app/assignment.js";

boot();

function boot() {
  loadState();
  bindEvents();
  render();
}

function bindEvents() {
  el.taskForm.addEventListener("submit", onTaskSubmit);
  el.cancelEditBtn.addEventListener("click", resetTaskForm);
  el.taskImportFile.addEventListener("change", onTaskImportFileChange);
  el.reviewerForm.addEventListener("submit", onReviewerSubmit);
  el.autoAssignBtn.addEventListener("click", onAutoAssign);
  el.clearReviewersBtn.addEventListener("click", onClearReviewers);
  el.downloadCsvBtn.addEventListener("click", onDownloadCsv);
  el.clearTasksBtn.addEventListener("click", onClearTasks);
}

function render() {
  renderApp(state, uiState, {
    onRemoveReviewer: removeReviewer,
    onStartEditTask: startEditTask,
    onRemoveTask: removeTask,
    onToggleManualReviewerEditor: toggleManualReviewerEditor,
    onSaveManualReviewers: saveManualReviewers,
    onCancelManualReviewers: cancelManualReviewers,
  });
}

function onDownloadCsv() {
  if (!state.tasks.length) {
    toast("No tasks available to download.");
    return;
  }

  exportTasksToCsv(state);
  toast("CSV downloaded.");
}

async function onTaskImportFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast("Only .csv files are supported.");
      resetImportInput();
      return;
    }

    const text = await file.text();
    const result = importTasksFromCsvText(text);

    if (result.error) {
      toast(result.error);
      resetImportInput();
      return;
    }

    state.tasks.push(...result.tasks);
    sortTasksByPoints();
    persistState();
    render();

    const skippedText = result.skippedCount ? `, ${result.skippedCount} rows skipped` : "";
    toast(`${result.tasks.length} tasks imported${skippedText}.`);
  } catch (error) {
    console.error("Task import error:", error);
    toast("Could not read CSV file. Please verify the file format.");
  }

  resetImportInput();
}

function onTaskSubmit(event) {
  event.preventDefault();

  const title = el.taskTitle.value.trim();
  const storyPoints = Number(el.taskPoints.value);

  if (!title) {
    toast("Task title is required.");
    return;
  }

  if (!Number.isFinite(storyPoints) || storyPoints < 1) {
    toast("Story point must be 1 or greater.");
    return;
  }

  const editingId = el.taskId.value;

  if (editingId) {
    const task = state.tasks.find((item) => item.id === editingId);
    if (task) {
      task.title = title;
      task.storyPoints = storyPoints;
    }
    toast("Task updated.");
  } else {
    state.tasks.push({
      id: crypto.randomUUID(),
      taskCode: "",
      title,
      storyPoints,
      reviewers: [],
    });
    toast("Task added.");
  }

  sortTasksByPoints();
  persistState();
  render();
  resetTaskForm();
}

function onReviewerSubmit(event) {
  event.preventDefault();

  const name = el.reviewerName.value.trim();
  if (!name) {
    toast("Reviewer name cannot be empty.");
    return;
  }

  const exists = state.reviewers.some(
    (reviewer) => reviewer.name.toLowerCase() === name.toLowerCase(),
  );

  if (exists) {
    toast("This reviewer is already in the list.");
    return;
  }

  state.reviewers.push({ id: crypto.randomUUID(), name });
  el.reviewerName.value = "";
  persistState();
  render();
  toast("Reviewer added.");
}

function onAutoAssign() {
  if (state.reviewers.length < MIN_REVIEWERS_PER_TASK) {
    toast("Add at least 2 reviewers for auto assignment.");
    return;
  }

  if (!state.tasks.length) {
    toast("Add tasks before running auto assignment.");
    return;
  }

  for (const task of state.tasks) {
    task.reviewers = [];
  }

  autoAssignReviewers(state);
  persistState();
  render();
  toast("Reviewers assigned with balanced workload.");
}

async function onClearReviewers() {
  if (!state.reviewers.length) {
    toast("No reviewers to clear.");
    return;
  }

  const confirmed = await confirmAction({
    title: "Clear All Reviewers",
    message: "This will remove all reviewers and clear reviewer assignments from all tasks.",
    confirmText: "Clear Reviewers",
    cancelText: "Cancel",
    danger: true,
  });

  if (!confirmed) {
    return;
  }

  state.reviewers = [];
  for (const task of state.tasks) {
    task.reviewers = [];
  }

  uiState.manualReviewerEditTaskId = null;
  persistState();
  render();
  toast("All reviewers cleared.");
}

async function onClearTasks() {
  if (!state.tasks.length) {
    toast("No tasks to clear.");
    return;
  }

  const confirmed = await confirmAction({
    title: "Clear Task List",
    message: "This will permanently delete all tasks in the current list.",
    confirmText: "Clear Tasks",
    cancelText: "Cancel",
    danger: true,
  });

  if (!confirmed) {
    return;
  }

  state.tasks = [];
  uiState.manualReviewerEditTaskId = null;
  resetTaskForm();
  persistState();
  render();
  toast("Task list cleared.");
}

function startEditTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  el.taskId.value = task.id;
  el.taskTitle.value = task.title;
  el.taskPoints.value = String(task.storyPoints);
  el.saveTaskBtn.textContent = "Update Task";
  el.cancelEditBtn.hidden = false;
  el.taskTitle.focus();
}

function toggleManualReviewerEditor(taskId) {
  uiState.manualReviewerEditTaskId = uiState.manualReviewerEditTaskId === taskId ? null : taskId;
  render();
}

function cancelManualReviewers() {
  uiState.manualReviewerEditTaskId = null;
  render();
}

function saveManualReviewers(taskId, taskWrapper) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  const selectedReviewerIds = Array.from(
    taskWrapper.querySelectorAll("input[data-manual-reviewer-id]:checked"),
  ).map((input) => input.getAttribute("data-manual-reviewer-id"));

  task.reviewers = selectedReviewerIds;
  uiState.manualReviewerEditTaskId = null;
  persistState();
  render();
  toast("Reviewer assignments updated.");
}

function removeTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  if (uiState.manualReviewerEditTaskId === taskId) {
    uiState.manualReviewerEditTaskId = null;
  }
  persistState();
  render();
  toast("Task deleted.");
}

function removeReviewer(reviewerId) {
  state.reviewers = state.reviewers.filter((reviewer) => reviewer.id !== reviewerId);
  for (const task of state.tasks) {
    task.reviewers = task.reviewers.filter((id) => id !== reviewerId);
  }
  persistState();
  render();
  toast("Reviewer removed.");
}

function resetTaskForm() {
  el.taskId.value = "";
  el.taskForm.reset();
  el.taskPoints.value = "3";
  el.saveTaskBtn.textContent = "Save Task";
  el.cancelEditBtn.hidden = true;
}

function resetImportInput() {
  el.taskImportFile.value = "";
}
