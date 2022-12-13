import { Result, zip2 } from "../shared/shared";

export const name = "Distress Signal";

type Packet = number | Array<Packet>;

function parsePacket(line: string) {
  // TODO: Some clever recursive shit
  return JSON.parse(line) as Packet;
}

type Comparison = "inOrder" | "outOfOrder" | "ambiguous";

function comparePackets(left: Packet, right: Packet): Comparison {
  if (typeof left === "number" && typeof right === "number") {
    return left < right ? "inOrder" : left > right ? "outOfOrder" : "ambiguous";
  }

  if (left instanceof Array && right instanceof Array) {
    const comparisons = zip2(left, right).map(([l, r]) => comparePackets(l, r));
    for (var comparison of comparisons) {
      if (comparison !== "ambiguous") {
        return comparison;
      }
    }

    if (comparisons.length < right.length) {
      return "inOrder";
    }

    if (comparisons.length < left.length) {
      return "outOfOrder";
    }

    return "ambiguous";
  }

  if (typeof left === "number") {
    return comparePackets([left], right);
  }

  return comparePackets(left, [right]);
}

export function partOne(input: string): Result<string, string> {
  const sum = input
    .split("\n\n")
    .map((pair) => pair.split("\n"))
    // Assume input is well formed here
    .map(([leftLine, rightLine]) => [parsePacket(leftLine as string), parsePacket(rightLine as string)])
    .map(([left, right], i) => (comparePackets(left as Packet, right as Packet) === "inOrder" ? i + 1 : 0))
    .reduce((a, b) => a + b);

  return { ok: sum.toString() };
}

export function partTwo(input: string): Result<string, string> {
  const packets = input
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => parsePacket(line));

  const divider1 = [[2]];
  const divider2 = [[6]];
  packets.push(divider1);
  packets.push(divider2);

  packets.sort((left, right) => {
    const comparison = comparePackets(left, right);
    return comparison === "ambiguous" ? 0 : comparison === "inOrder" ? -1 : 1;
  });

  // Reference equality go brrrrr
  const decoderKey = packets
    .map((packet, i) => (packet === divider1 || packet === divider2 ? i + 1 : 1))
    .reduce((a, b) => a * b);

  return { ok: decoderKey.toString() };
}
