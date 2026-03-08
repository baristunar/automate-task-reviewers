import { el } from "./dom.js";
import { calculateCurrentLoad } from "./state.js";
import { escapeHtml } from "../utils/index.js";

export function renderApp(state, uiState, handlers) {
  renderReviewerList(state, handlers);
  renderTaskList(state, uiState, handlers);
  updateStats(state);
}

function renderReviewerList(state, handlers) {
  const load = calculateCurrentLoad();
  el.reviewerList.innerHTML = "";

  if (!state.reviewers.length) {
    el.reviewerList.innerHTML = '<li class="small">No reviewers added yet.</li>';
    return;
  }

  for (const reviewer of state.reviewers) {
    const li = document.createElement("li");
    li.className = "pill";
    li.innerHTML = `
      <span>${escapeHtml(reviewer.name)}</span>
      <strong>${load[reviewer.id] || 0} SP</strong>
      <button class="icon-btn" data-action="remove-reviewer" type="button">x</button>
    `;

    li.querySelector("button").addEventListener("click", () => {
      handlers.onRemoveReviewer(reviewer.id);
    });

    el.reviewerList.appendChild(li);
  }
}

function renderTaskList(state, uiState, handlers) {
  el.taskList.innerHTML = "";

  if (!state.tasks.length) {
    el.taskList.innerHTML =
      '<div class="empty">No tasks yet. Add a task from the left panel.</div>';
    return;
  }

  for (const task of state.tasks) {
    const wrapper = document.createElement("article");
    wrapper.className = "task-item";
    const fullTitle = task.taskCode
      ? `${escapeHtml(task.taskCode)}: ${escapeHtml(task.title)}`
      : escapeHtml(task.title);

    const reviewerChips = task.reviewers.length
      ? task.reviewers
          .map((id) => state.reviewers.find((item) => item.id === id)?.name)
          .filter(Boolean)
          .map((name) => `<span class="reviewer-chip">${escapeHtml(name)}</span>`)
          .join("")
      : '<span class="meta">No reviewers assigned yet.</span>';

    const manualEditor =
      uiState.manualReviewerEditTaskId === task.id ? renderManualReviewerEditor(state, task) : "";

    wrapper.innerHTML = `
      <div class="task-top">
        <div>
          <h3 class="task-title">${fullTitle}</h3>
          <div class="task-meta-row">
            <span class="sp-badge">${task.storyPoints} SP</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-ghost" data-action="toggle-reviewer-editor" type="button">Edit Reviewers</button>
          <button class="btn btn-ghost" data-action="edit-task" type="button">Edit</button>
          <button class="btn btn-danger" data-action="delete-task" type="button">Delete</button>
        </div>
      </div>
      <div class="row">${reviewerChips}</div>
      ${manualEditor}
    `;

    wrapper
      .querySelector('[data-action="toggle-reviewer-editor"]')
      .addEventListener("click", () => handlers.onToggleManualReviewerEditor(task.id));

    wrapper
      .querySelector('[data-action="edit-task"]')
      .addEventListener("click", () => handlers.onStartEditTask(task.id));

    wrapper
      .querySelector('[data-action="delete-task"]')
      .addEventListener("click", () => handlers.onRemoveTask(task.id));

    const saveManualBtn = wrapper.querySelector('[data-action="save-manual-reviewers"]');
    if (saveManualBtn) {
      saveManualBtn.addEventListener("click", () => {
        handlers.onSaveManualReviewers(task.id, wrapper);
      });
    }

    const cancelManualBtn = wrapper.querySelector('[data-action="cancel-manual-reviewers"]');
    if (cancelManualBtn) {
      cancelManualBtn.addEventListener("click", () => {
        handlers.onCancelManualReviewers();
      });
    }

    el.taskList.appendChild(wrapper);
  }
}

function renderManualReviewerEditor(state, task) {
  if (!state.reviewers.length) {
    return '<div class="manual-reviewer-box"><span class="small">Add reviewers first.</span></div>';
  }

  const reviewerOptions = state.reviewers
    .map((reviewer) => {
      const checked = task.reviewers.includes(reviewer.id) ? "checked" : "";
      return `
        <label class="manual-reviewer-option">
          <input type="checkbox" data-manual-reviewer-id="${reviewer.id}" ${checked} />
          <span>${escapeHtml(reviewer.name)}</span>
        </label>
      `;
    })
    .join("");

  return `
    <div class="manual-reviewer-box">
      <div class="manual-reviewer-list">${reviewerOptions}</div>
      <div class="row">
        <button class="btn btn-primary" data-action="save-manual-reviewers" type="button">Save Reviewers</button>
        <button class="btn btn-ghost" data-action="cancel-manual-reviewers" type="button">Cancel</button>
      </div>
    </div>
  `;
}

function updateStats(state) {
  const totalPoints = state.tasks.reduce((sum, task) => sum + task.storyPoints, 0);
  const reviewerCount = state.reviewers.length;
  const taskCount = state.tasks.length;

  el.stats.textContent = `${taskCount} task • ${totalPoints} SP • ${reviewerCount} reviewer`;
}
