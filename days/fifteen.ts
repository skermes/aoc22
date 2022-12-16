import { isOk, Result } from "../shared/shared";

export const name = "Beacon Exclusion Zone";

type Sensor = {
  location: [number, number];
  beacon: [number, number];
};

type InclusiveRange =
  | {
      min: number;
      max: number;
    }
  | { min: null; max: null };

function union(a: InclusiveRange, b: InclusiveRange) {
  if (a.min === null) {
    return b;
  }

  if (b.min === null) {
    return a;
  }

  return { min: Math.min(a.min, b.min), max: Math.max(a.max, b.max) };
}

function within(range: InclusiveRange, value: number) {
  if (range.min === null) {
    return false;
  }

  return range.min <= value && range.max >= value;
}

function size(range: InclusiveRange) {
  if (range.min === null) {
    return 0;
  }

  return range.max - range.min + 1;
}

function parseSensor(line: string): Result<Sensor, string> {
  const matches = line.match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/);
  if (!matches) {
    return { err: `badParse ${line}` };
  }

  // We know these indexes are good because we know the match worked, casts are safe
  const sx = Number.parseInt(matches[1] as string);
  const sy = Number.parseInt(matches[2] as string);
  const bx = Number.parseInt(matches[3] as string);
  const by = Number.parseInt(matches[4] as string);

  return { ok: { location: [sx, sy], beacon: [bx, by] } };
}

function pointsCoveredOnRow(sensor: Sensor, row: number) {
  const sensorRange = Math.abs(sensor.location[0] - sensor.beacon[0]) + Math.abs(sensor.location[1] - sensor.beacon[1]);
  const offset = sensorRange - Math.abs(sensor.location[1] - row);

  if (offset < 0) {
    return { min: null, max: null };
  }

  return { min: sensor.location[0] - offset, max: sensor.location[0] + offset };
}

export const EXAMPLE = `Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3`;

export function partOne(input: string): Result<string, string> {
  const sensors = input.split("\n").mapFallible(parseSensor);
  if (!isOk(sensors)) {
    return sensors;
  }

  const rowRange = sensors.ok.map((sensor) => pointsCoveredOnRow(sensor, 2000000)).reduce(union);
  const beaconsInRange = new Set(
    sensors.ok
      .filter((sensor) => sensor.beacon[1] === 2000000 && within(rowRange, sensor.beacon[1]))
      .map((sensor) => sensor.beacon.toString())
  );

  return { ok: (size(rowRange) - beaconsInRange.size).toString() };
}

export function partTwo(input: string): Result<string, string> {
  const sensors = input.split("\n").mapFallible(parseSensor);
  if (!isOk(sensors)) {
    return sensors;
  }

  for (var row = 0; row < 4_000_000; row++) {
    const ranges = sensors.ok
      .map((sensor) => pointsCoveredOnRow(sensor, row))
      // Cast is safe because of the filter
      .filter((range) => range.min !== null) as Array<{ min: number; max: number }>;
    ranges.sort((a, b) => a.min - b.min);

    let rowRange = ranges[0] as InclusiveRange;
    for (var r of ranges.slice(1)) {
      if (!rowRange || rowRange.min === null) {
        continue;
      }

      if (rowRange.max < r.min - 1) {
        return { ok: ((r.min - 1) * 4_000_000 + row).toString() };
      } else {
        rowRange = union(rowRange, r);
      }
    }
  }

  return { err: "noSolution" };
}
