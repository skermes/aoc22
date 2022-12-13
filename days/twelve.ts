import { isOk, Result } from "../shared/shared";

export const name = "Hill Climbing Algorithm";

type TopoMap = { start: [number, number]; end: [number, number]; map: number[][] };

function parseTopoMap(text: string): Result<TopoMap, string> {
  var start: [number, number] | undefined = undefined;
  var end: [number, number] | undefined = undefined;
  const map: number[][] = [];
  text.split("\n").forEach((line, row) => {
    const mapRow: number[] = [];
    line.split("").forEach((char, col) => {
      if (char === "S") {
        start = [row, col];
        mapRow.push(97 - 97);
      } else if (char === "E") {
        end = [row, col];
        mapRow.push(122 - 97);
      } else {
        mapRow.push(char.charCodeAt(0) - 97);
      }
    });
    map.push(mapRow);
  });

  if (start === undefined || end === undefined) {
    return { err: "Missing start or end" };
  }

  return { ok: { start, end, map } };
}

function at(map: number[][], point: [number, number]) {
  const row = map[point[0]];
  if (!row) {
    // Sentinel value greater than you step up to from z, ensure we never go out of bound
    return 28;
  }

  const value = row[point[1]];
  return value === undefined ? 28 : value;
}

function aStarDistance(
  starts: [number, number][],
  heuristic: (candidate: [number, number]) => number,
  finished: (candidate: [number, number]) => boolean,
  canTraverse: (here: [number, number], there: [number, number]) => boolean
) {
  const distances: Record<string, number> = {
    // [start.toString()]: 0,
  };
  starts.forEach((start) => (distances[start.toString()] = 0));
  var toVisit: [number, number][] = [...starts];

  var iterations = 0;
  while (toVisit.length > 0) {
    // Break out if it runs too long, avoid spending forever on this one.
    if (iterations > 100000) {
      break;
    }

    // Who needs a priority queue, right?
    // toVisit must have at least one element in order for us to enter the loop so this will always find something, so
    // we know the cast is safe.
    const [nextRow, nextCol] = toVisit.minBy((position) => {
      return (distances[position.toString()] || 0) + heuristic(position);
    }) as [number, number];
    toVisit = toVisit.filter(([row, col]) => row !== nextRow || col !== nextCol);

    if (finished([nextRow, nextCol])) {
      return { ok: distances[[nextRow, nextCol].toString()] as number };
    }

    const hereDist = distances[[nextRow, nextCol].toString()] as number;
    const neighbors: [number, number][] = [
      [nextRow - 1, nextCol],
      [nextRow + 1, nextCol],
      [nextRow, nextCol - 1],
      [nextRow, nextCol + 1],
    ];
    neighbors
      .filter((neighbor) => canTraverse([nextRow, nextCol], neighbor))
      .filter((neighbor) => {
        const nd = distances[neighbor.toString()];
        return nd === undefined || nd > hereDist + 1;
      })
      .forEach((neighbor) => {
        toVisit.push(neighbor);
        distances[neighbor.toString()] = hereDist + 1;
      });

    iterations += 1;
  }

  return { err: "can't find path" };
}

export function partOne(input: string): Result<string, string> {
  const mapResult = parseTopoMap(input);
  if (!isOk(mapResult)) {
    return mapResult;
  }

  const map = mapResult.ok;

  function heuristic(candidate: [number, number]) {
    const mahattan = Math.abs(map.end[0] - candidate[0]) + Math.abs(map.end[1] - candidate[1]);
    return mahattan;
  }

  function finished(candidate: [number, number]) {
    return candidate[0] === map.end[0] && candidate[1] === map.end[1];
  }

  function canTraverse(here: [number, number], there: [number, number]) {
    return at(map.map, there) <= at(map.map, here) + 1;
  }

  const distance = aStarDistance([map.start], heuristic, finished, canTraverse);
  if (!isOk(distance)) {
    return distance;
  }
  return { ok: distance.ok.toString() };
}

export function partTwo(input: string): Result<string, string> {
  const mapResult = parseTopoMap(input);
  if (!isOk(mapResult)) {
    return mapResult;
  }

  const map = mapResult.ok;

  function heuristic(candidate: [number, number]) {
    const mahattan = Math.abs(map.end[0] - candidate[0]) + Math.abs(map.end[1] - candidate[1]);
    return mahattan;
  }

  function finished(candidate: [number, number]) {
    return candidate[0] === map.end[0] && candidate[1] === map.end[1];
  }

  function canTraverse(here: [number, number], there: [number, number]) {
    return at(map.map, there) <= at(map.map, here) + 1;
  }

  const as = range(map.map.length)
    .flatMap((row) => range((map.map[0] as number[]).length).map((col) => [row, col] as [number, number]))
    .filter((point) => at(map.map, point) === 0);

  const distance = aStarDistance(as, heuristic, finished, canTraverse);
  if (!isOk(distance)) {
    return distance;
  }
  return { ok: distance.ok.toString() };
}

function range(end: number) {
  const xs = [];
  for (var i = 0; i < end; i++) {
    xs.push(i);
  }
  return xs;
}
