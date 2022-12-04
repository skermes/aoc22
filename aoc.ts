#!/usr/bin/env ts-node

import fs from "fs";
import https from "https";
import process from "process";
import { isOk, Result } from "./shared/shared";

import * as day1 from "./days/one";
import * as day2 from "./days/two";
import * as day3 from "./days/three";
import * as day4 from "./days/four";

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

function fmtDuration(nanos: bigint): string {
  if (nanos < 1_000) {
    return `${nanos}ns`;
  } else if (nanos < 1_000_000) {
    return `${nanos / 1000n}µs`;
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
    const [resultOne, durationOne] = time(day.partOne.bind(null, input.ok));
    if (isOk(resultOne)) {
      console.log("🟢", resultOne.ok.padEnd(60), fmtDuration(durationOne));
    } else {
      console.log("❗️", resultOne.err);
    }

    const [resultTwo, durationTwo] = time(day.partTwo.bind(null, input.ok));
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

var totalDuration = 0n;
withInput(1, (result) => (totalDuration += runDay(result, day1)));
withInput(2, (result) => (totalDuration += runDay(result, day2)));
withInput(3, (result) => (totalDuration += runDay(result, day3)));
withInput(4, (result) => (totalDuration += runDay(result, day4)));

console.log("".padEnd(70, "─"));
console.log("Total:", fmtDuration(totalDuration).padStart(62));
