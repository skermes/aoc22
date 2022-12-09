import { Result, zip2, zip4 } from "../shared/shared";

export const name = "Treetop Tree House";

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
  const maxs = row.reductions((a, b) => Math.max(a, b), -1);
  return zip2(row, maxs).map(([tree, max]) => tree > max);
}

function axisScenicScore(row: number[]) {
  const lastSeenAts = row.reductions(
    (lastSeenAt, nextTree, nextLoc) => {
      return lastSeenAt.map((loc, height) => (height <= nextTree ? nextLoc : loc));
    },
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );

  return zip2(row, lastSeenAts).map(([tree, lastSeenAt], i) => i - (lastSeenAt[tree] || 0));
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
