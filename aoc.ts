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
      { headers: { Cookie: `session=${sessionCookie}` } },
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

function runDay(input: InputResult, day: Day): bigint {
  console.log(day.name);

  var duration = 0n;
  if (isOk(input)) {
    const [resultOne, durationOne] = time(trap(day.partOne.bind(null, input.ok)));
    if (isOk(resultOne)) {
      console.log("🟢", resultOne.ok.padEnd(60), fmtDuration(durationOne));
    } else {
      console.log("❗️", resultOne.err);
    }

    const [resultTwo, durationTwo] = time(trap(day.partTwo.bind(null, input.ok)));
    if (isOk(resultTwo)) {
      console.log("🟢", resultTwo.ok.padEnd(60), fmtDuration(durationTwo));
    } else {
      console.log("❗️", resultTwo.err);
    }

    duration = durationOne + durationTwo;
  } else {
    console.log("❗️", input.err);
  }

  console.log();

  return duration;
}

const dayArg = Number.parseInt(process.argv[process.argv.length - 1] || "");
const targetDays = Number.isNaN(dayArg)
  ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
  : [dayArg];

var totalDuration = 0n;

targetDays.forEach((i) => {
  const day = DAY_MODULES[i - 1];
  if (!day) {
    console.log("❗️ Unknown day", day);
  } else {
    withInput(i, (result) => (totalDuration += runDay(result, day)));
  }
});

console.log("".padEnd(70, "─"));
console.log("Total:", fmtDuration(totalDuration).padStart(62));
