import { isOk, Result } from "../shared/shared";

export const name = "Proboscidea Volcanium";

type Valve = {
  name: string;
  flow: number;
  edges: string[];
};

function parseValve(line: string): Result<Valve, string> {
  const matches = line.match(/Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? ([\w+, ]+)/);
  if (!matches) {
    return { err: `badParse ${line}` };
  }

  const [_, name, flow, allEdges] = matches;
  const edges = allEdges?.split(", ");

  // All the undefined inference here is coming from the matches destructure, but we know that's safe because matches
  // is non-null.
  return { ok: { name: name as string, flow: Number.parseInt(flow as string), edges: edges as string[] } };
}

export function toGraphviz(valve: Valve) {
  const fill = valve.name === "AA" ? "#aaffdd" : valve.flow > 0 ? "#ffddaa" : "white";

  let gv = `${valve.name} [label="${valve.name}:${valve.flow}" style="filled" fillcolor="${fill}"]\n`;
  valve.edges
    .filter((edge) => edge < valve.name)
    .forEach((edge) => {
      gv += `${valve.name} -- ${edge}\n`;
    });

  // for (var edge of valve.edges) {
  //   gv += `${valve.name} -- ${edge}\n`;
  // }
  return gv;
}

export function partOne(input: string): Result<string, string> {
  const valves = input.split("\n").mapFallible(parseValve);
  if (!isOk(valves)) {
    return valves;
  }

  // valves.ok.forEach((valve) => console.log(toGraphviz(valve)));

  const allzerostwoedges = valves.ok.filter((v) => v.flow === 0).every((v) => v.edges.length === 2);
  const zeroesnontwoedges = valves.ok.filter((v) => v.flow === 0).filter((v) => v.edges.length !== 2);

  console.log(allzerostwoedges);
  console.log(zeroesnontwoedges);

  return { err: "notImplemented" };
}

export function partTwo(_input: string): Result<string, string> {
  return { err: "notImplemented" };
}
