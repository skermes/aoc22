import { Result } from "../shared/shared";

export const name = "Rock Paper Scissors";

// If statements are hard
const GAME_SCORES = {
  "A X": 4,
  "A Y": 8,
  "A Z": 3,
  "B X": 1,
  "B Y": 5,
  "B Z": 9,
  "C X": 7,
  "C Y": 2,
  "C Z": 6,
};

export function partOne(input: string): Result<string, string> {
  const totalScore = input
    .split("\n")
    // Cast here assumes the input is well-formed
    .map((line) => GAME_SCORES[line as keyof typeof GAME_SCORES])
    .reduce((a, b) => a + b);
  return { ok: totalScore.toString() };
}

const GAME_SCORES_2 = {
  "A X": GAME_SCORES["A Z"],
  "A Y": GAME_SCORES["A X"],
  "A Z": GAME_SCORES["A Y"],
  "B X": GAME_SCORES["B X"],
  "B Y": GAME_SCORES["B Y"],
  "B Z": GAME_SCORES["B Z"],
  "C X": GAME_SCORES["C Y"],
  "C Y": GAME_SCORES["C Z"],
  "C Z": GAME_SCORES["C X"],
};

export function partTwo(input: string): Result<string, string> {
  const totalScore = input
    .split("\n")
    // Cast here assumes the input is well-formed
    .map((line) => GAME_SCORES_2[line as keyof typeof GAME_SCORES_2])
    .reduce((a, b) => a + b);
  return { ok: totalScore.toString() };
}
