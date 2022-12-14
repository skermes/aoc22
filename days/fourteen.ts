import { Result, zip2 } from "../shared/shared";

export const name = "Regolith Reservoir";

type Item = "air" | "rock" | "sand" | "void";
type Rocks = {
  map: Record<string, Item>;
  minX: number;
  maxX: number;
  // Assuming minY is 0
  maxY: number;
  entryPoint: [number, number];
};

function addRockFormation(rocks: Rocks, line: string) {
  // console.log("adding rocks", line);

  const points = line.split(" -> ").map((s) => {
    const [x, y] = s.split(",");
    // Assume input is well-formed
    return [Number.parseInt(x as string), Number.parseInt(y as string)] as [number, number];
  });

  // console.log("adding rocks", points);

  zip2(points, points.slice(1)).forEach(([[startX, startY], [endX, endY]]) => {
    // console.log("adding rocks from", [startX, startY], "to", [endX, endY]);

    const lowX = Math.min(startX, endX);
    const highX = Math.max(startX, endX);
    const lowY = Math.min(startY, endY);
    const highY = Math.max(startY, endY);

    // const dx = startX < endX ? 1 : -1;
    // const dy = startY < endY ? 1 : -1;

    // console.log({ dx, dy });
    for (var x = lowX; x <= highX; x++) {
      for (var y = lowY; y <= highY; y++) {
        // console.log("adding rock at", [x, y]);

        rocks.map[[x, y].toString()] = "rock";

        rocks.minX = Math.min(rocks.minX, x);
        rocks.maxX = Math.max(rocks.maxX, x);
        rocks.maxY = Math.max(rocks.maxY, y);
      }
    }
  });
}

function at(rocks: Rocks, point: [number, number]) {
  if (point[0] < rocks.minX || point[0] > rocks.maxX || point[1] < 0 || point[1] > rocks.maxY) {
    return "void";
  }

  return rocks.map[point.toString()] || "air";
}

function at2(rocks: Rocks, point: [number, number]) {
  if (point[1] === rocks.maxY + 2) {
    return "rock";
  }

  return rocks.map[point.toString()] || "air";
}

type SandFate = "atRest" | "inTheVoid" | "entryBlocked";

function dropSand(rocks: Rocks, at: (rocks: Rocks, point: [number, number]) => Item): SandFate {
  const newSand = [rocks.entryPoint[0], rocks.entryPoint[1]] as [number, number];
  while (true) {
    const down = at(rocks, [newSand[0], newSand[1] + 1]);
    const downLeft = at(rocks, [newSand[0] - 1, newSand[1] + 1]);
    const downRight = at(rocks, [newSand[0] + 1, newSand[1] + 1]);

    if (down === "void") {
      return "inTheVoid";
    } else if (down === "air") {
      newSand[1] += 1;
    } else if (downLeft === "void") {
      return "inTheVoid";
    } else if (downLeft === "air") {
      newSand[0] -= 1;
      newSand[1] += 1;
    } else if (downRight === "void") {
      return "inTheVoid";
    } else if (downRight === "air") {
      newSand[0] += 1;
      newSand[1] += 1;
    } else {
      rocks.map[newSand.toString()] = "sand";

      if (newSand[0] == rocks.entryPoint[0] && newSand[1] === rocks.entryPoint[1]) {
        return "entryBlocked";
      }

      return "atRest";
    }
  }
}

export function logRocks(rocks: Rocks) {
  for (var row = 0; row <= rocks.maxY; row++) {
    var line = "";
    for (var col = rocks.minX; col <= rocks.maxX; col++) {
      const thing = at(rocks, [col, row]);
      if (thing === "air") {
        line += " ";
      } else if (thing === "rock") {
        line += "#";
      } else if (thing === "sand") {
        line += "o";
      } else if (thing === "void") {
        line += "~";
      }
    }
    console.log(line);
  }
}

export const EXAMPLE = `498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9`;

export function partOne(input: string): Result<string, string> {
  const rocks: Rocks = {
    map: {},
    minX: 500,
    maxX: 500,
    maxY: 0,
    entryPoint: [500, 0],
  };
  input.split("\n").forEach((line) => addRockFormation(rocks, line));

  var units = 0;
  while (true) {
    const fate = dropSand(rocks, at);
    if (fate === "inTheVoid") {
      break;
    } else {
      units++;
    }
  }

  return { ok: units.toString() };
}

export function partTwo(input: string): Result<string, string> {
  const rocks: Rocks = {
    map: {},
    minX: 500,
    maxX: 500,
    maxY: 0,
    entryPoint: [500, 0],
  };
  input.split("\n").forEach((line) => addRockFormation(rocks, line));

  var units = 0;
  while (true) {
    const fate = dropSand(rocks, at2);
    if (fate === "entryBlocked") {
      units++;
      break;
    } else {
      units++;
    }
  }

  return { ok: units.toString() };
}
