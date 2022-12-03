import { Result } from "../shared/shared";

export const name = "Rucksack Reorganization ";

// - becauce priorities are 1-indexed
const priorities = "-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function partOne(input: string): Result<string, string> {
  const allPriorities = input
    .split("\n")
    .map((line) => {
      const front = line.slice(0, line.length / 2);
      const back = line.slice(line.length / 2, line.length);
      // Well-formed input should keep us from getting to - here but gotta make noUncheckedIndexAccess happy
      const common = front.split("").filter((c) => back.includes(c))[0] || "-";
      return priorities.indexOf(common);
    })
    .reduce((a, b) => a + b);

  return { ok: JSON.stringify(allPriorities) };
}

export function partTwo(input: string): Result<string, string> {
  let prioritySum = 0;
  for (var group of input.matchAll(/([a-zA-Z]+)\n([a-zA-Z]+)\n([a-zA-Z]+)/g)) {
    const [_, one, two, three] = group;
    if (!one || !two || !three) {
      return { err: "badData" };
    }
    const common = one.split("").filter((c) => two.includes(c) && three.includes(c))[0] || "-";
    prioritySum += priorities.indexOf(common);
  }

  return { ok: prioritySum.toString() };
}
