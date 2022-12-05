import { isOk, Result } from "../shared/shared";

export const name = "Supply Stacks";

function parseInitial(text: string) {
  const lines = text.split("\n");
  // TODO: Figure out width dynamically
  // Without an explicit annotation it infers this as never[][]?
  const stacks: string[][] = [[], [], [], [], [], [], [], [], []];
  for (var i = lines.length - 2; i >= 0; i--) {
    for (var j = 0; j < stacks.length; j++) {
      const c = (lines[i] || "")[j * 4 + 1];
      const s = stacks[j];
      if (c && c !== " " && s) {
        s.push(c);
      }
    }
  }
  return stacks;
}

function parseInstruction(line: string) {
  const [_move, count, _from, source, _to, target] = line.split(" ");
  if (!count || !source || !target) {
    const result = { err: `badParse: ${line}` };
    return result;
  }

  return {
    ok: { count: Number.parseInt(count), source: Number.parseInt(source) - 1, target: Number.parseInt(target) - 1 },
  };
}

// const example = `    [D]
// [N] [C]
// [Z] [M] [P]
//  1   2   3

// move 1 from 2 to 1
// move 3 from 1 to 3
// move 2 from 2 to 1
// move 1 from 1 to 2`;

export function partOne(input: string): Result<string, string> {
  const [initial, instructions] = input.split("\n\n");
  if (!initial || !instructions) {
    return { err: `noBlankLine` };
  }

  const stacks = parseInitial(initial);
  const orders = instructions.split("\n").mapFallible(parseInstruction);
  if (!isOk(orders)) {
    return orders;
  }

  const result = orders.ok.forEachFallible((instruction) => {
    const source = stacks[instruction.source];
    const target = stacks[instruction.target];
    if (!source || !target) {
      const result = { err: `badInstructionIndex: ${instruction.source}, ${instruction.target}` };
      return result;
    }

    if (source.length < instruction.count) {
      return { err: `notEnoughItems` };
    }

    for (var i = 0; i < instruction.count; i++) {
      target.push(source.pop() || "");
    }

    return { ok: null };
  });

  if (!isOk(result)) {
    return result;
  }

  const tops = stacks.map((stack) => stack[stack.length - 1]).join("");

  return { ok: tops };
}

export function partTwo(input: string): Result<string, string> {
  const [initial, instructions] = input.split("\n\n");
  if (!initial || !instructions) {
    return { err: `noBlankLine` };
  }

  const stacks = parseInitial(initial);
  const orders = instructions.split("\n").mapFallible(parseInstruction);
  if (!isOk(orders)) {
    return orders;
  }

  const result = orders.ok.forEachFallible((instruction) => {
    const source = stacks[instruction.source];
    const target = stacks[instruction.target];
    if (!source || !target) {
      const result = { err: `badInstructionIndex: ${instruction.source}, ${instruction.target}` };
      return result;
    }

    if (source.length < instruction.count) {
      return { err: `notEnoughItems` };
    }

    const moved = source.splice(source.length - instruction.count, instruction.count);
    moved.forEach((item) => target.push(item));

    return { ok: null };
  });

  if (!isOk(result)) {
    return result;
  }

  const tops = stacks.map((stack) => stack[stack.length - 1]).join("");

  return { ok: tops };
}
