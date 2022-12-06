import { Result } from "../shared/shared";

export const name = "Tuning Trouble";

class CountSet {
  private values: Record<string, number>;

  constructor() {
    this.values = {};
  }

  insert(value: string | undefined) {
    if (value === undefined) {
      return;
    }

    this.values[value] = (this.values[value] || 0) + 1;
  }

  remove(value: string | undefined) {
    if (value === undefined) {
      return;
    }

    const oldVal = this.values[value];
    if (oldVal === undefined) {
      return;
    } else if (oldVal === 1) {
      delete this.values[value];
    } else {
      this.values[value] = oldVal - 1;
    }
  }

  length() {
    return Object.keys(this.values).length;
  }
}

export function partOne(input: string): Result<string, string> {
  const window = new CountSet();

  for (var i = 0; i < input.length; i++) {
    window.remove(input[i - 4]);
    window.insert(input[i]);
    if (window.length() === 4) {
      return { ok: (i + 1).toString() };
    }
  }

  return { err: "notFound" };
}

export function partTwo(input: string): Result<string, string> {
  const window = new CountSet();

  for (var i = 0; i < input.length; i++) {
    window.remove(input[i - 14]);
    window.insert(input[i]);
    if (window.length() === 14) {
      return { ok: (i + 1).toString() };
    }
  }

  return { err: "notFound" };
}
