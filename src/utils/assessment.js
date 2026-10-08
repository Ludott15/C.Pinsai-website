/** Sums the score of the selected answer of every question. */
export const computeScore = (questions, selections) =>
  questions.reduce((total, question, index) => {
    const answer = question.answers[selections[index]];
    return total + (answer ? answer.score : 0);
  }, 0);

/** Returns the profile whose [min, max] range contains the score. */
export const findProfile = (profiles, score) =>
  profiles.find((profile) => score >= profile.min && score <= profile.max) ?? profiles[profiles.length - 1];
