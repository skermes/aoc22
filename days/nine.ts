import { isOk, Result, zip2 } from "../shared/shared";

export const name = "Rope Bridge";

type AxisUnitVector = [0, 1] | [0, -1] | [1, 0] | [-1, 0];
type Motion = { vector: AxisUnitVector; distance: number };

const DIRECTION_TO_VECTOR: Record<"U" | "D" | "L" | "R", AxisUnitVector> = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0],
};
function parseMotion(line: string) {
  const [direction, distance] = line.split(" ");
  if (!direction || !distance) {
    const result = { err: `badParse ${line}` };
    return result;
  }

  if (direction !== "U" && direction !== "D" && direction !== "L" && direction !== "R") {
    return { err: `badParse ${line}` };
  }

  return { ok: { vector: DIRECTION_TO_VECTOR[direction], distance: Number.parseInt(distance) } };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function shift(position: [number, number], vector: [number, number]) {
  position[0] = position[0] + vector[0];
  position[1] = position[1] + vector[1];
}

function countTailPositions(motions: Motion[], initialRope: Array<[number, number]>) {
  const rope = [...initialRope];
  const head = rope[0];
  const tail = rope[rope.length - 1];
  if (!head || !tail) {
    return 0;
  }

  const tailPositions: Record<string, boolean> = { "0,0": true };

  motions.forEach((motion) => {
    for (var i = 0; i < motion.distance; i++) {
      shift(head, motion.vector);

      zip2(rope, rope.slice(1)).forEach(([prev, next]) => {
        const offset: [number, number] = [prev[0] - next[0], prev[1] - next[1]];

        if (offset[0] == -2 || offset[0] == 2 || offset[1] == -2 || offset[1] == 2) {
          shift(next, [clamp(offset[0], -1, 1), clamp(offset[1], -1, 1)]);
        }
      });

      tailPositions[tail.toString()] = true;
    }
  });

  return Object.keys(tailPositions).length;
}

export function partOne(input: string): Result<string, string> {
  const motions = input.split("\n").mapFallible(parseMotion);
  if (!isOk(motions)) {
    return motions;
  }

  const tailCount = countTailPositions(motions.ok, [
    [0, 0],
    [0, 0],
  ]);

  return { ok: tailCount.toString() };
}

export function partTwo(input: string): Result<string, string> {
  const motions = input.split("\n").mapFallible(parseMotion);
  if (!isOk(motions)) {
    return motions;
  }

  const tailCount = countTailPositions(motions.ok, [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);

  return { ok: tailCount.toString() };
}
