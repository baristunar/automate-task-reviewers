export const state = {
  tasks: [],
  reviewers: [],
};

export const uiState = {
  manualReviewerEditTaskId: null,
};

export function sortTasksByPoints() {
  state.tasks.sort((a, b) => b.storyPoints - a.storyPoints);
}

export function calculateCurrentLoad() {
  const load = {};

  for (const reviewer of state.reviewers) {
    load[reviewer.id] = 0;
  }

  for (const task of state.tasks) {
    for (const reviewerId of task.reviewers) {
      if (reviewerId in load) {
        load[reviewerId] += task.storyPoints;
      }
    }
  }

  return load;
}
