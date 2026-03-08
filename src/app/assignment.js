import { MIN_REVIEWERS_PER_TASK } from "../config.js";

export function autoAssignReviewers(state) {
  const reviewerLoad = {};
  for (const reviewer of state.reviewers) {
    reviewerLoad[reviewer.id] = 0;
  }

  const sortedTasks = [...state.tasks].sort((a, b) => b.storyPoints - a.storyPoints);

  for (const task of sortedTasks) {
    const selected = pickReviewersForTask(state.reviewers, reviewerLoad, MIN_REVIEWERS_PER_TASK);
    task.reviewers = selected;
    for (const reviewerId of selected) {
      reviewerLoad[reviewerId] += task.storyPoints;
    }
  }
}

function pickReviewersForTask(reviewers, reviewerLoad, minCount) {
  const selected = [];

  while (selected.length < minCount) {
    const sortedReviewers = [...reviewers].sort((a, b) => {
      const diff = reviewerLoad[a.id] - reviewerLoad[b.id];
      if (diff !== 0) {
        return diff;
      }
      return a.name.localeCompare(b.name, "tr");
    });

    const candidate = sortedReviewers.find((reviewer) => !selected.includes(reviewer.id));

    if (!candidate) {
      break;
    }

    selected.push(candidate.id);
  }

  return selected;
}
