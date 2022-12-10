import { isOk, Result } from "../shared/shared";

export const name = "Cathode-Ray Tube";

type Instruction = { op: "addx"; value: number } | { op: "noop" };
type Cpu = { cycle: number; x: number };

function parseInstruction(line: string): Result<Instruction, string> {
  const [op, value] = line.split(" ");

  switch (op) {
    case "noop": {
      return { ok: { op: "noop" } };
    }
    case "addx": {
      if (value === undefined) {
        return { err: `badParse ${line}` };
      }
      return { ok: { op: "addx", value: Number.parseInt(value) } };
    }
    default: {
      return { err: `badParse ${line}` };
    }
  }
}

function padInstruction(instruction: Instruction): Instruction[] {
  switch (instruction.op) {
    case "noop": {
      return [instruction];
    }
    case "addx": {
      return [{ op: "noop" }, instruction];
    }
  }
}

function execute(cpu: Cpu, instruction: Instruction) {
  switch (instruction.op) {
    case "noop": {
      return { cycle: cpu.cycle + 1, x: cpu.x };
    }
    case "addx": {
      return { cycle: cpu.cycle + 1, x: cpu.x + instruction.value };
    }
  }
}

function signalStrength(cpu: Cpu) {
  return cpu.cycle * cpu.x;
}

export function partOne(input: string): Result<string, string> {
  const instructions = input.split("\n").mapFallible(parseInstruction);
  if (!isOk(instructions)) {
    return instructions;
  }

  const padded = instructions.ok.flatMap(padInstruction);
  const states = padded.reductions(execute, { cycle: 1, x: 1 });

  const state20 = states[19];
  const state60 = states[59];
  const state100 = states[99];
  const state140 = states[139];
  const state180 = states[179];
  const state220 = states[219];

  if (!state20 || !state60 || !state100 || !state140 || !state180 || !state220) {
    return { err: "notEnoughStates" };
  }

  return {
    ok: (
      signalStrength(state20) +
      signalStrength(state60) +
      signalStrength(state100) +
      signalStrength(state140) +
      signalStrength(state180) +
      signalStrength(state220)
    ).toString(),
  };
}

export function partTwo(input: string): Result<string, string> {
  const instructions = input.split("\n").mapFallible(parseInstruction);
  if (!isOk(instructions)) {
    return instructions;
  }

  const padded = instructions.ok.flatMap(padInstruction);
  const states = padded.reductions(execute, { cycle: 1, x: 1 });

  let output = "";
  for (var row = 0; row < 6; row++) {
    for (var col = 0; col < 40; col++) {
      const i = row * 40 + col;
      const state = states[i];
      if (!state) {
        return { err: `missingState ${i}` };
      }

      if (state.x >= col - 1 && state.x <= col + 1) {
        output += "█";
      } else {
        output += " ";
      }
    }
    output += "\n";
  }

  return { ok: output };
}
