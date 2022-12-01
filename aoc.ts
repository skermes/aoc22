#!/usr/bin/env ts-node

import fs from "fs";
import https from "https";
import { isOk, Result } from "./shared/shared";

import * as day1 from "./days/one";

type InputResult = Result<string, "badDay" | "notYet" | "badFetch">;
type Day = { partOne: (input: string) => Result<string, string>; partTwo: (input: string) => Result<string, string> };

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

function runDay(input: InputResult, day: Day) {
  if (isOk(input)) {
    console.log(day.partOne(input.ok));
    console.log(day.partTwo(input.ok));
  } else {
    console.log(input.err);
  }
}

withInput(1, (result) => runDay(result, day1));
