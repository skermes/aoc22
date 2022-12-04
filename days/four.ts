import { isOk, Result } from "../shared/shared";

export const name = "Day Four";

const PATTERN = /^(\d+)-(\d+),(\d+)-(\d+)$/;
function parsePair(line: string) {
  const [_, lstart, lend, rstart, rend] = line.match(PATTERN) || [];
  if (!lstart || !lend || !rstart || !rend) {
    // I don't know why but if I don't assign result to a variable here it changes the inferred return type of the
    // whole function.
    const result = { err: `badParse: ${line}` };
    return result;
  }

  return {
    ok: {
      left: { start: Number.parseInt(lstart), end: Number.parseInt(lend) },
      right: { start: Number.parseInt(rstart), end: Number.parseInt(rend) },
    },
  };
}

function within(target: number, range: { start: number; end: number }) {
  return target >= range.start && target <= range.end;
}

export function partOne(input: string): Result<string, string> {
  const start = process.hrtime.bigint();
  const pairs = input.split("\n").mapFallible(parsePair);
  const parseTime = process.hrtime.bigint() - start;

  console.log("partone parse nanos", parseTime);

  if (!isOk(pairs)) {
    return pairs;
  }

  const fullyContains = pairs.ok.filter(
    (pair) =>
      (within(pair.left.start, pair.right) && within(pair.left.end, pair.right)) ||
      (within(pair.right.start, pair.left) && within(pair.right.end, pair.left))
  ).length;

  return { ok: fullyContains.toString() };
}

export function partTwo(input: string): Result<string, string> {
  const pairs = input.split("\n").mapFallible(parsePair);

  if (!isOk(pairs)) {
    return pairs;
  }

  const partlyContains = pairs.ok.filter(
    (pair) =>
      within(pair.left.start, pair.right) ||
      within(pair.left.end, pair.right) ||
      within(pair.right.start, pair.left) ||
      within(pair.right.end, pair.left)
  ).length;

  return { ok: partlyContains.toString() };
}
