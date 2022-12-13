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
  start: [number, number],
  heuristic: (candidate: [number, number]) => number,
  finished: (candidate: [number, number]) => boolean,
  canTraverse: (here: [number, number], there: [number, number]) => boolean
) {
  const distances: Record<string, number> = {
    [start.toString()]: 0,
  };
  var toVisit: [number, number][] = [start];

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

  const distance = aStarDistance(map.start, heuristic, finished, canTraverse);
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

  // This part takes a lot longer than the first, I think because I get stuck in the ocean of `c` spots, where all the
  // identical heights make A^ fall back to BFS. I tried including the x position in the heuristic which I thought would
  // drive it toward the column of `b`s on the left, but no dice.
  function heuristic(candidate: [number, number]) {
    return at(map.map, candidate);
  }

  function finished(candidate: [number, number]) {
    return at(map.map, candidate) === 0;
  }

  function canTraverse(here: [number, number], there: [number, number]) {
    return at(map.map, here) <= at(map.map, there) + 1;
  }

  const distance = aStarDistance(map.end, heuristic, finished, canTraverse);
  if (!isOk(distance)) {
    return distance;
  }
  return { ok: distance.ok.toString() };
}
