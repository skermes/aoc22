import { Result } from "../shared/shared";

export const name = "Proboscidea Volcanium";

type Valve = {
  name: string;
  flow: number;
  edges: Record<string, number>;
  open: boolean;
};

export function parseValve(line: string): Result<Valve, string> {
  const matches = line.match(/Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? ([\w+, ]+)/);
  if (!matches) {
    return { err: `badParse ${line}` };
  }

  const [_, name, flow, allEdges] = matches;
  const edges = allEdges?.split(", ") as string[];
  const weightedEdges: Record<string, number> = edges.reduce((acc, edge) => ({ ...acc, [edge]: 1 }), {});

  // All the undefined inference here is coming from the matches destructure, but we know that's safe because matches
  // is non-null.
  return { ok: { name: name as string, flow: Number.parseInt(flow as string), edges: weightedEdges, open: false } };
}

export function toGraphviz(valve: Valve) {
  const fill = valve.name === "AA" ? "#aaffdd" : valve.flow > 0 ? "#ffddaa" : "white";

  let gv = `${valve.name} [label="${valve.name}:${valve.flow}" style="filled" fillcolor="${fill}"]\n`;
  Object.keys(valve.edges).forEach((edge) => {
    gv += `${valve.name} -> ${edge} [label="${valve.edges[edge]}"]\n`;
  });

  // valve.edges
  //   .filter((edge) => edge < valve.name)
  //   .forEach((edge) => {
  //     gv += `${valve.name} -- ${edge}\n`;
  //   });

  // for (var edge of valve.edges) {
  //   gv += `${valve.name} -- ${edge}\n`;
  // }
  return gv;
}

// This function liberally assumes its getting passed correct data
export function compactZeroNode(valves: Record<string, Valve>, node: string) {
  const zeroValve = valves[node] as Valve;
  const [leftNode, rightNode] = Object.keys(zeroValve.edges) as [string, string];
  const leftValve = valves[leftNode] as Valve;
  const rightValve = valves[rightNode] as Valve;
  leftValve.edges[rightNode] = (zeroValve.edges[rightNode] as number) + 1;
  rightValve.edges[leftNode] = (zeroValve.edges[leftNode] as number) + 1;
  delete leftValve.edges[node];
  delete rightValve.edges[node];
  delete valves[node];
}

export function addScoreNode(valves: Record<string, Valve>, node: string) {
  const valve = valves[node] as Valve;
  if (valve.flow > 0) {
    const scoreValve: Valve = {
      name: `${node}_score`,
      flow: valve.flow,
      edges: { [node]: 0 },
      open: false,
    };
    valve.edges[scoreValve.name] = 1;
    valve.flow = 0;
    valves[scoreValve.name] = scoreValve;
  }
}

export function dfsAllPaths(valves: Record<string, Valve>, current: string, score: number, time: number): number {
  if (time <= 0) {
    return score;
  }

  let bestScore = 0;
  const currentValve = valves[current] as Valve;

  if (!currentValve.open) {
    const bestScoreAfterOpening = Object.keys(currentValve.edges)
      .map((node) => {
        const updatedValves = { ...valves, [current]: { ...currentValve, open: false } };
        return dfsAllPaths(
          updatedValves,
          node,
          score + currentValve.flow * (time - 1),
          time - 1 - (currentValve.edges[node] as number)
        );
      })
      .reduce((a, b) => Math.max(a, b));
    bestScore = Math.max(bestScore, bestScoreAfterOpening);
  }

  const bestScoreWithoutOpening = Object.keys(currentValve.edges)
    .map((node) => {
      return dfsAllPaths(valves, node, score, time - (currentValve.edges[node] as number));
    })
    .reduce((a, b) => Math.max(a, b));

  return Math.max(bestScore, bestScoreWithoutOpening);
}

function memoKey(current: string, score: number, time: number, scoreVisited: Record<string, boolean>) {
  return `${current}-${score}-${time}-${Object.keys(scoreVisited).join("-")}`;
}

export function dfsAllPaths2(
  valves: Record<string, Valve>,
  current: string,
  score: number,
  time: number,
  scoreVisited: Record<string, boolean>,
  path: Array<string>,
  memo: Record<string, [number, string[]]>
): [number, string[]] {
  const key = memoKey(current, score, time, scoreVisited);
  if (memo[key]) {
    return memo[key] as [number, string[]];
  }

  if (scoreVisited[current]) {
    return [-Infinity, []];
  }

  if (time <= 0) {
    return [score, path];
  }

  const currentValve = valves[current] as Valve;

  const nextScoreVisited = currentValve.flow > 0 ? { ...scoreVisited, [current]: true } : scoreVisited;
  const nextScore = score + currentValve.flow * time;

  const best = Object.entries(currentValve.edges)
    .map(([next, travelTime]) =>
      dfsAllPaths2(valves, next, nextScore, time - travelTime, nextScoreVisited, [...path, next], memo)
    )
    .reduce((best, next) => (best[0] > next[0] ? best : next));
  memo[key] = best;
  return best;
}

export function resimulateScore(valves: Record<string, Valve>, path: string[]) {
  let t = 0;
  let current = "AA";
  let flow = 0;
  let score = 0;
  for (var node of path) {
    const distance = valves[current]?.edges[node] || 0;
    t += distance;
    current = node;
    score += flow * distance;
    console.log("minute", t, "moved to", current, "flow is", flow, "score is", score);
    flow += valves[current]?.flow || 0;
  }
  return score;
}

export const EXAMPLE = `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`;

export function partOne(_input: string): Result<string, string> {
  // const valves = EXAMPLE.split("\n").mapFallible(parseValve);
  // if (!isOk(valves)) {
  //   return valves;
  // }

  // const valvesMap: Record<string, Valve> = {};
  // valves.ok.forEach((valve) => (valvesMap[valve.name] = valve));

  // compactZeroNode(valves.ok, 'PM');

  // const zeroNodes = valves.ok.filter((valve) => valve.flow === 0 && valve.name !== "AA").map((valve) => valve.name);
  // zeroNodes.forEach((node) => compactZeroNode(valvesMap, node));

  // Object.keys(valvesMap).forEach((node) => addScoreNode(valvesMap, node));

  // Object.keys(valvesMap).forEach((node) => console.log(toGraphviz(valvesMap[node] as Valve)));
  // valves.ok.forEach((valve) => console.log(toGraphviz(valve)));

  // const allzerostwoedges = valves.ok.filter((v) => v.flow === 0).every((v) => v.edges.length === 2);
  // const zeroesnontwoedges = valves.ok.filter((v) => v.flow === 0).filter((v) => v.edges.length !== 2);

  // console.log(allzerostwoedges);
  // console.log(zeroesnontwoedges);

  // const score = dfsAllPaths(valvesMap, 'AA', 0, 20)

  // console.log(score);

  // const [score, path] = dfsAllPaths2(valvesMap, "AA", 0, 30, {}, [], {});
  // console.log(score);
  // console.log(path);
  // console.log(resimulateScore(valvesMap, path));

  return { err: "notImplemented" };
}

export function partTwo(_input: string): Result<string, string> {
  return { err: "notImplemented" };
}
