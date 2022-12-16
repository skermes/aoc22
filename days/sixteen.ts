import { isOk, Result } from "../shared/shared";

export const name = "Proboscidea Volcanium";

type Valve = {
  name: string;
  flow: number;
  edges: Record<string, number>;
  open: boolean;
};

function parseValve(line: string): Result<Valve, string> {
  const matches = line.match(/Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? ([\w+, ]+)/);
  if (!matches) {
    return { err: `badParse ${line}` };
  }

  const [_, name, flow, allEdges] = matches;
  const edges = allEdges?.split(", ") as string[];
  const weightedEdges: Record<string, number> = edges.reduce((acc, edge) => ({...acc, [edge]: 1}), {});

  // All the undefined inference here is coming from the matches destructure, but we know that's safe because matches
  // is non-null.
  return { ok: { name: name as string, flow: Number.parseInt(flow as string), edges: weightedEdges, open: false } };
}

export function toGraphviz(valve: Valve) {
  const fill = valve.name === "AA" ? "#aaffdd" : valve.flow > 0 ? "#ffddaa" : "white";

  let gv = `${valve.name} [label="${valve.name}:${valve.flow}" style="filled" fillcolor="${fill}"]\n`;
  Object.keys(valve.edges).filter(e => e < valve.name).forEach(edge => {
    gv += `${valve.name} -- ${edge} [label="${valve.edges[edge]}"]\n`
  })

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
  leftValve.edges[rightNode] = zeroValve.edges[rightNode] as number + 1;
  rightValve.edges[leftNode] = zeroValve.edges[leftNode] as number + 1;
  delete leftValve.edges[node];
  delete rightValve.edges[node];
  delete valves[node];
}

export function dfsAllPaths(valves: Record<string, Valve>, current: string, score: number, time: number): number {
  if (time <= 0) {
    return score;
  }

  let bestScore = 0;
  const currentValve = valves[current] as Valve;

  if (!currentValve.open) {
    const bestScoreAfterOpening = Object.keys(currentValve.edges).map(node => {
      const updatedValves = { ...valves, [current]: { ...currentValve, open: false}};
      return dfsAllPaths(updatedValves, node, score + currentValve.flow * (time - 1), time - 1 - (currentValve.edges[node] as number))
    }).reduce((a, b) => Math.max(a ,b))
    bestScore = Math.max(bestScore, bestScoreAfterOpening);
  }

  const bestScoreWithoutOpening = Object.keys(currentValve.edges).map(node => {
    return dfsAllPaths(valves, node, score, time - (currentValve.edges[node] as number));
  }).reduce((a, b) => Math.max(a, b));

  return Math.max(bestScore, bestScoreWithoutOpening);
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
  const valves = EXAMPLE.split("\n").mapFallible(parseValve);
  if (!isOk(valves)) {
    return valves;
  }

  const valvesMap: Record<string, Valve> = {};
  valves.ok.forEach(valve => valvesMap[valve.name] = valve);

  // compactZeroNode(valves.ok, 'PM');

  const zeroNodes = valves.ok.filter(valve => valve.flow === 0 && valve.name !== 'AA').map(valve => valve.name);
  zeroNodes.forEach(node => compactZeroNode(valvesMap, node))

  Object.keys(valvesMap).forEach(node => console.log(toGraphviz(valvesMap[node] as Valve)))
  // valves.ok.forEach((valve) => console.log(toGraphviz(valve)));

  // const allzerostwoedges = valves.ok.filter((v) => v.flow === 0).every((v) => v.edges.length === 2);
  // const zeroesnontwoedges = valves.ok.filter((v) => v.flow === 0).filter((v) => v.edges.length !== 2);

  // console.log(allzerostwoedges);
  // console.log(zeroesnontwoedges);

  // const score = dfsAllPaths(valvesMap, 'AA', 0, 20)

  // console.log(score);

  return { err: "notImplemented" };
}

export function partTwo(_input: string): Result<string, string> {
  return { err: "notImplemented" };
}
