import { isOk, Result } from "../shared/shared";

export const name = "Monkey Math";

type Op = "+" | "-" | "*" | "/";
// It doesn't look like we ever have an expression with mixed names and values in the input
type Expression = { type: "literal"; value: number } | { type: "expression"; left: string; right: string; op: Op };
type Binding = { name: string; expr: Expression };

function parseBinding(line: string): Result<Binding, string> {
  const match = line.match(/^(\w+): ((\d+)|((\w+) ([-+*/]) (\w+)))$/);
  if (!match) {
    return { err: `badParse ${line}` };
  }

  const [_whole, name, _right, literal, _expr, lval, op, rval] = match;
  if (!name) {
    return { err: `badParse ${line}` };
  }

  if (literal) {
    return { ok: { name: name, expr: { type: "literal", value: Number.parseInt(literal) } } };
  }

  if (lval && op && rval) {
    return { ok: { name: name, expr: { type: "expression", left: lval, right: rval, op: op as Op } } };
  }

  return { err: `badParse ${line}` };
}

function evalExpr(left: number, right: number, op: Op) {
  switch (op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
  }
}

function evaluate(
  bindings: Record<string, Expression>,
  name: string,
  memo: Record<string, number>
): Result<number, string> {
  if (memo[name] !== undefined) {
    return { ok: memo[name] as number };
  }

  const binding = bindings[name];
  if (!binding) {
    return { err: `${name} not present in bindings` };
  }

  if (binding.type === "literal") {
    memo[name] = binding.value;
    // console.log(name, "=", binding.value);
    return { ok: binding.value };
  }

  const left = evaluate(bindings, binding.left, memo);
  const right = evaluate(bindings, binding.right, memo);
  if (!isOk(left)) {
    return left;
  }
  if (!isOk(right)) {
    return right;
  }

  const value = evalExpr(left.ok, right.ok, binding.op);
  memo[name] = value;
  // console.log(name, "=", value);
  return { ok: value };
}

export function pprint(bindings: Record<string, Expression>, name: string): string {
  // console.log("pprinting", name);
  if (name === "humn") {
    return "human";
  }

  const binding = bindings[name] as Expression;

  if (binding.type === "literal") {
    return binding.value.toString();
  }

  if (name === "root") {
    return `${pprint(bindings, binding.left)} = ${pprint(bindings, binding.right)}`;
  }

  return `(${pprint(bindings, binding.left)} ${binding.op} ${pprint(bindings, binding.right)})`;
}

export const EXAMPLE = `root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32`;

export function partOne(input: string): Result<string, string> {
  const bindings = input.split("\n").mapFallible(parseBinding);
  if (!isOk(bindings)) {
    return bindings;
  }

  const bindingsMap: Record<string, Expression> = {};
  bindings.ok.forEach((b) => (bindingsMap[b.name] = b.expr));

  const root = evaluate(bindingsMap, "root", {});
  if (!isOk(root)) {
    return root;
  }

  return { ok: root.ok.toString() };
}

export function partTwo(input: string): Result<string, string> {
  const bindings = input.split("\n").mapFallible(parseBinding);
  if (!isOk(bindings)) {
    return bindings;
  }

  const bindingsMap: Record<string, Expression> = {};
  bindings.ok.forEach((b) => (bindingsMap[b.name] = b.expr));

  console.log(pprint(bindingsMap, "root"));

  return { err: "notImplemented" };
}
