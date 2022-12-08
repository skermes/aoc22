import { Result } from "../shared/shared";

export const name = "Day Eight";

function range(end: number) {
  const xs = [];
  for (var i = 0; i < end; i++) {
    xs.push(i);
  }
  return xs;
}

function reverseRows<T>(matrix: T[][]) {
  return matrix.map((row) => {
    const r2 = [...row];
    r2.reverse();
    return r2;
  });
}

function transposeMatrix<T>(matrix: T[][]) {
  const width = matrix[0]?.length;
  if (width === undefined) {
    return [];
  }

  // Assume matrix is rectangular, just go ahead and cast
  return range(width).map((i) => matrix.map((row) => row[i] as T));
}

function visibleTrees(row: number[]) {
  return row
    .reduce(
      (acc, nextTree) => {
        const prevTree = acc[acc.length - 1];
        if (!prevTree) {
          return [{ maxHeight: nextTree, visible: true }];
        } else {
          acc.push({ maxHeight: Math.max(prevTree.maxHeight, nextTree), visible: nextTree > prevTree.maxHeight });
          return acc;
        }
      },
      [{ maxHeight: -1, visible: false }]
    )
    .map((annotated) => annotated.visible)
    .slice(1);
}

function axisScenicScore(row: number[]) {
  return row
    .reduce(
      (acc, nextTree, i) => {
        const prevTree = acc[acc.length - 1] as {
          lastAtLeast: [number, number, number, number, number, number, number, number, number];
          vision: number;
        };
        const vision = i - (prevTree.lastAtLeast[nextTree] || 0);
        const newLast = [...prevTree.lastAtLeast];
        for (var j = 0; j <= nextTree; j++) {
          newLast[j] = i;
        }
        acc.push({ lastAtLeast: newLast, vision });
        return acc;
      },
      [{ lastAtLeast: [0, 0, 0, 0, 0, 0, 0, 0, 0], vision: 0 }]
    )
    .map((annotated) => annotated.vision)
    .slice(1);
}

function zip4<T>(as: T[], bs: T[], cs: T[], ds: T[]): Array<[T, T, T, T]> {
  const vals = [];
  const len = Math.min(as.length, bs.length, cs.length, ds.length);
  for (var i = 0; i < len; i++) {
    // Because len is the min all these indexes are safe.
    const val = [as[i] as T, bs[i] as T, cs[i] as T, ds[i] as T] as [T, T, T, T];
    vals.push(val);
  }
  return vals;
}

export function partOne(input: string): Result<string, string> {
  const original = input.split("\n").map((row) => row.split("").map((c) => Number.parseInt(c)));

  const ltr = original.map(visibleTrees);
  const rtl = reverseRows(reverseRows(original).map(visibleTrees));
  const ttb = transposeMatrix(transposeMatrix(original).map(visibleTrees));
  const btt = transposeMatrix(reverseRows(reverseRows(transposeMatrix(original)).map(visibleTrees)));

  const visibleCount = zip4(ltr.flat(), rtl.flat(), ttb.flat(), btt.flat())
    .map(([a, b, c, d]) => a || b || c || d)
    .filter((visible) => visible).length;

  return { ok: visibleCount.toString() };
}

export function partTwo(input: string): Result<string, string> {
  const original = input.split("\n").map((row) => row.split("").map((c) => Number.parseInt(c)));

  const ltr = original.map(axisScenicScore);
  const rtl = reverseRows(reverseRows(original).map(axisScenicScore));
  const ttb = transposeMatrix(transposeMatrix(original).map(axisScenicScore));
  const btt = transposeMatrix(reverseRows(reverseRows(transposeMatrix(original)).map(axisScenicScore)));

  const mostScenicTree = zip4(ltr.flat(), rtl.flat(), ttb.flat(), btt.flat())
    .map(([a, b, c, d]) => a * b * c * d)
    .reduce((a, b) => Math.max(a, b));

  return { ok: mostScenicTree.toString() };
}
