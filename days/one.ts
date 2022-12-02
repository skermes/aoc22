import { Result } from "../shared/shared";

export const name = "Calorie Counting";

export function partOne(input: string): Result<string, string> {
  const calories = input.split("\n\n").map((elf) =>
    elf
      .split("\n")
      .map((x) => Number.parseInt(x))
      .reduce((a, b) => a + b)
  );
  return { ok: Math.max.apply(null, calories).toString() };
}

export function partTwo(input: string): Result<string, string> {
  const calories = input.split("\n\n").map((elf) =>
    elf
      .split("\n")
      .map((x) => Number.parseInt(x))
      .reduce((a, b) => a + b)
  );
  calories.sort();
  const topThree = calories.slice(calories.length - 3).reduce((a, b) => a + b);
  return { ok: topThree.toString() };
}
