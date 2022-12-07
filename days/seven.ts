import { isOk, Result } from "../shared/shared";

export const name = "No Space Left On Device";

type TerminalLine =
  | { type: "cd"; to: string }
  | { type: "ls" }
  | { type: "file"; size: number; name: string }
  | { type: "directory"; name: string };

type Filesystem = Record<string, Array<string | number>>;

function parseTerminalLine(line: string): Result<TerminalLine, string> {
  const tokens = line.split(" ");
  if (tokens[0] === "$" && tokens[1] === "cd" && tokens[2]) {
    return { ok: { type: "cd", to: tokens[2] } };
  } else if (tokens[0] === "$" && tokens[1] === "ls") {
    return { ok: { type: "ls" } };
  } else if (tokens[0] === "dir" && tokens[1]) {
    return { ok: { type: "directory", name: tokens[1] } };
  } else if (tokens[0] && tokens[1]) {
    return { ok: { type: "file", name: tokens[1], size: Number.parseInt(tokens[0]) } };
  } else {
    return { err: `badParse: ${line}` };
  }
}

function appendPath(base: string, path: string) {
  if (base === "") {
    return path;
  } else if (base === "/") {
    return base + path;
  } else {
    return base + "/" + path;
  }
}

function buildFilesystem(output: TerminalLine[]) {
  let cwd = "";
  const filesystem: Filesystem = {};

  output.forEach((line) => {
    if (line.type === "cd") {
      if (line.to === "..") {
        cwd = cwd.slice(0, cwd.lastIndexOf("/"));
        if (cwd === "") {
          cwd = "/";
        }
      } else {
        cwd = appendPath(cwd, line.to);
      }

      if (filesystem[cwd] === undefined) {
        filesystem[cwd] = [];
      }
    } else if (line.type === "ls") {
      // Don't actually have to do anything here
    } else if (line.type === "file") {
      filesystem[cwd]?.push(line.size);
    } else {
      filesystem[cwd]?.push(appendPath(cwd, line.name));
    }
  });

  return filesystem;
}

// Note that memoization here only really helps if you call this more than once - the filesystem is a tree so
// we only recur into each directory once while summing the whole filesystem.
function directorySize(memo: Record<string, number>, filesystem: Filesystem, dir: string): number {
  const memoed = memo[dir];
  if (memoed !== undefined) {
    return memoed;
  }

  const entries = filesystem[dir];
  if (entries) {
    const size = entries
      .map((entry) => {
        if (typeof entry === "number") {
          return entry;
        } else {
          return directorySize(memo, filesystem, entry);
        }
      })
      .reduce((a, b) => a + b);
    memo[dir] = size;
    return size;
  } else {
    return 0;
  }
}

export function partOne(input: string): Result<string, string> {
  const output = input.split("\n").mapFallible(parseTerminalLine);
  if (!isOk(output)) {
    return output;
  }

  const filesystem = buildFilesystem(output.ok);

  const memo = {};
  const sumUnderLimit = Object.keys(filesystem)
    .map((dir) => directorySize(memo, filesystem, dir))
    .filter((size) => size <= 100_000)
    .reduce((a, b) => a + b);

  return { ok: sumUnderLimit.toString() };
}

export function partTwo(input: string): Result<string, string> {
  const output = input.split("\n").mapFallible(parseTerminalLine);
  if (!isOk(output)) {
    return output;
  }

  const filesystem = buildFilesystem(output.ok);
  const memo = {};

  const totalSpace = 70_000_000;
  const totalUsed = directorySize(memo, filesystem, "/");
  const currentlyFree = totalSpace - totalUsed;
  const targetFree = 30_000_000;
  const needToDelete = targetFree - currentlyFree;

  const actualDelete = Object.keys(filesystem)
    .map((dir) => directorySize(memo, filesystem, dir))
    .filter((size) => size >= needToDelete)
    .reduce((a, b) => Math.min(a, b));

  return { ok: actualDelete.toString() };
}
