#!/usr/bin/env ts-node

import fs from "fs";
import https from "https";
import process from "process";
import { isOk, Result } from "./shared/shared";

import * as day1 from "./days/one";
import * as day2 from "./days/two";
import * as day3 from "./days/three";
import * as day4 from "./days/four";
import * as day5 from "./days/five";
import * as day6 from "./days/six";
import * as day7 from "./days/seven";
import * as day8 from "./days/eight";
import * as day9 from "./days/nine";
import * as day10 from "./days/ten";
import * as day11 from "./days/eleven";
import * as day12 from "./days/twelve";
import * as day13 from "./days/thirteen";
import * as day14 from "./days/fourteen";
import * as day15 from "./days/fifteen";
import * as day16 from "./days/sixteen";
import * as day17 from "./days/seventeen";
import * as day18 from "./days/eighteen";
import * as day19 from "./days/nineteen";
import * as day20 from "./days/twenty";
import * as day21 from "./days/twenty-one";
import * as day22 from "./days/twenty-two";
import * as day23 from "./days/twenty-three";
import * as day24 from "./days/twenty-four";
import * as day25 from "./days/twenty-five";

const DAY_MODULES = [
  day1,
  day2,
  day3,
  day4,
  day5,
  day6,
  day7,
  day8,
  day9,
  day10,
  day11,
  day12,
  day13,
  day14,
  day15,
  day16,
  day17,
  day18,
  day19,
  day20,
  day21,
  day22,
  day23,
  day24,
  day25,
];

type InputResult = Result<string, "badDay" | "notYet" | "badFetch">;
type Day = {
  name: string;
  partOne: (input: string) => Result<string, string>;
  partTwo: (input: string) => Result<string, string>;
};

const sessionCookie = fs.readFileSync("COOKIE").toString().trim();

function withInput(day: number, callback: (result: InputResult) => void): void {
  if (day < 0 || day > 25) {
    callback({ err: "badDay" });
    return;
  }

  const now = new Date();
  if (now < new Date(2022, 11, day)) {
    callback({ err: "notYet" });
    return;
  }

  try {
    const data = fs.readFileSync(`./inputs/${day}.txt`);
    callback({ ok: data.toString().trim() });
  } catch {
    https.get(
      `https://adventofcode.com/2022/day/${day}/input`,
      {
        headers: { Cookie: `session=${sessionCookie}`, "User-Agent": "github.com/skermes/aoc22 by skermes@gmail.com" },
      },
      (response) => {
        var body = "";
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () => {
          fs.writeFile(`inputs/${day}.txt`, body, () => {
            return;
          });
          callback({ ok: body.trim() });
        });
        response.on("error", () =>
          callback({
            err: "badFetch",
          })
        );
      }
    );
  }
}

function time<T>(fn: () => T): [T, bigint] {
  const start = process.hrtime.bigint();
  const value = fn();
  const nanos = process.hrtime.bigint() - start;
  return [value, nanos];
}

function trap<T>(fn: () => Result<T, string>): () => Result<T, string> {
  return () => {
    try {
      return fn();
    } catch (e) {
      return { err: (e as Object).toString() };
    }
  };
}

function fmtDuration(nanos: bigint): string {
  if (nanos < 1_000) {
    return `${nanos}ns`;
  } else if (nanos < 1_000_000) {
    return `${nanos / 1000n}µs`;
  } else if (nanos < 10_000_000) {
    const millis = nanos / 1_000_000n;
    const hundred_micros = (nanos - millis * 1_000_000n) / 100_000n;
    return `${millis}.${hundred_micros}ms`;
  } else if (nanos < 1_000_000_000) {
    return `${nanos / 1_000_000n}ms`;
  } else {
    return `${nanos / 1_000_000_000n}s`;
  }
}

function breakWords(text: string, width: number) {
  const words = text.split(" ");
  const lines = [words[0]];
  for (var word of words.slice(1)) {
    // Lines is never empty, cast is safe
    if ((lines[lines.length - 1] as string).length + word.length >= width) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${lines[lines.length - 1]} ${word}`;
    }
  }
  return lines;
}

function bg(r: number, g: number, b: number, text: string) {
  return `\u001B[48;2;${r};${g};${b}m${text}\u001B[48;5;0m`;
}

const NAME_WIDTH = 15;
const INDICATOR_WIDTH = 2;
const SOLUTION_WIDTH = 60;
const TIME_WIDTH = 5;

const INDICATOR_GOOD = bg(140, 200, 70, "".padEnd(INDICATOR_WIDTH));
const INDICATOR_BAD = bg(240, 100, 50, "".padEnd(INDICATOR_WIDTH));
const INDICATOR_WARN = bg(210, 190, 70, "".padEnd(INDICATOR_WIDTH));

const FIRST_BORDER =
  "┌" +
  "".padEnd(NAME_WIDTH, "─") +
  "┬" +
  "".padEnd(INDICATOR_WIDTH, "─") +
  "┬" +
  "".padEnd(SOLUTION_WIDTH, "─") +
  "┬" +
  "".padEnd(TIME_WIDTH, "─") +
  "┐";

const DAY_SEPARATOR =
  "├" +
  "".padEnd(NAME_WIDTH, "─") +
  "┼" +
  "".padEnd(INDICATOR_WIDTH, "─") +
  "┼" +
  "".padEnd(SOLUTION_WIDTH, "─") +
  "┼" +
  "".padEnd(TIME_WIDTH, "─") +
  "┤";

const LAST_BORDER =
  "└" +
  "".padEnd(NAME_WIDTH, "─") +
  "┴" +
  "".padEnd(INDICATOR_WIDTH, "─") +
  "┴" +
  "".padEnd(SOLUTION_WIDTH, "─") +
  "┴" +
  "".padEnd(TIME_WIDTH, "─") +
  "┘";

function solutionLine(name: string | undefined, indicator: string, solution: string, time: string) {
  return (
    "│" +
    (name || "").padEnd(NAME_WIDTH) +
    "│" +
    indicator.padEnd(INDICATOR_WIDTH) +
    "│" +
    solution.padEnd(SOLUTION_WIDTH) +
    "│" +
    time.padStart(TIME_WIDTH) +
    "│"
  );
}

function interDaySeparator(name: string | undefined) {
  return (
    "│" +
    (name || "").padEnd(NAME_WIDTH) +
    "├" +
    "".padEnd(INDICATOR_WIDTH, "─") +
    "┼" +
    "".padEnd(SOLUTION_WIDTH, "─") +
    "┼" +
    "".padStart(TIME_WIDTH, "─") +
    "┤"
  );
}

function logDay(name: string, solutionSections: Array<[Result<string, string>, bigint]>, isFirst: boolean) {
  const nameLines = breakWords(name, NAME_WIDTH);
  var nextNameLine = 0;

  if (isFirst) {
    console.log(FIRST_BORDER);
  } else {
    console.log(DAY_SEPARATOR);
  }
  solutionSections.forEach(([solution, duration], i) => {
    if (i > 0) {
      const name = nameLines[nextNameLine];
      nextNameLine += 1;
      console.log(interDaySeparator(name));
    }

    const indicator = isOk(solution) ? INDICATOR_GOOD : solution.err === "notYet" ? INDICATOR_WARN : INDICATOR_BAD;
    const time = fmtDuration(duration);
    const text = isOk(solution) ? solution.ok : solution.err;
    text.split("\n").forEach((line, i) => {
      if (line.length === 0) {
        return;
      }

      const name = nameLines[nextNameLine];
      nextNameLine += 1;
      console.log(solutionLine(name, indicator, line, i === 0 ? time : ""));
    });
  });
}

function runDay(input: InputResult, day: Day, isFirst: boolean): bigint {
  const sections: Array<[Result<string, string>, bigint]> = isOk(input)
    ? [time(trap(day.partOne.bind(null, input.ok))), time(trap(day.partTwo.bind(null, input.ok)))]
    : [[input, 0n]];

  logDay(day.name, sections, isFirst);
  return sections.reduce((sum, section) => sum + section[1], 0n);
}

const dayArg = Number.parseInt(process.argv[process.argv.length - 1] || "");
const targetDays = Number.isNaN(dayArg)
  ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
  : [dayArg];

var totalDuration = 0n;

targetDays.forEach((dayIndex, i) => {
  const day = DAY_MODULES[dayIndex - 1];
  if (!day) {
    logDay("", [[{ err: "badDay" }, 0n]], true);
  } else {
    withInput(dayIndex, (result) => (totalDuration += runDay(result, day, i === 0)));
  }
});

console.log(DAY_SEPARATOR);
console.log(solutionLine("", "", "Total".padStart(SOLUTION_WIDTH), fmtDuration(totalDuration)));
console.log(LAST_BORDER);
