import { isOk, mapOk, Result } from "../shared/shared";

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

export function pprint(expr: NestedExpression): string {
  // console.log("pprinting", name);
  if (expr.type === 'variable') {
    return expr.name;
  }

  if (expr.type === "literal") {
    return expr.value.toString();
  }

  // if (name === "root") {
  //   return `${pprint(bindings, binding.left)} = ${pprint(bindings, binding.right)}`;
  // }

  return `(${pprint(expr.left)} ${expr.op} ${pprint(expr.right)})`;
}

type NestedExpression =
  | { type: "literal"; value: number }
  | { type: "variable"; name: string }
  | { type: "expression"; left: NestedExpression; right: NestedExpression; op: Op };

function simplify(bindings: Record<string, Expression>, name: string): NestedExpression {
  if (name === 'humn') {
    return { type: 'variable', name: 'humn'}
  }

  const expr = bindings[name] as Expression;
  if (expr.type === 'literal') {
    return { type: 'literal', value: expr.value}
  }

  const left = simplify(bindings, expr.left);
  const right = simplify(bindings, expr.right);

  if (left.type === 'literal' && right.type === 'literal') {
    return { type: 'literal', value: evalExpr(left.value, right.value, expr.op)}
  }

  return { type: 'expression', left, right, op: expr.op};
}

function solveForHumn(expr: NestedExpression, constant: number): Result<number, string> {
  if (expr.type === 'literal') {
    return { err: 'left hand side must be expression or variable' }
  }

  if (expr.type === 'variable') {
    return { ok: constant }
  }

  // Because there's only one variable in the puzzle we know that exactly one side of the simplified expression must
  // be a constant.
  if (expr.left.type === 'literal') {
    // 2 + right = constant -> right = constant - 2
    // 2 - right = constant -> right * -1 = constant - 2
    // 2 * right = constant -> right = constant / 2
    // 2 / right = constant -> 1 / right = constant * 2 -> infinite recursion err
    switch (expr.op) {
      case '+': return solveForHumn(expr.right, constant - expr.left.value)
      case '-': return solveForHumn({ type: 'expression', left: expr.right, right: { type: 'literal', value: -1 }, op: '*' }, constant - expr.left.value)
      case '*': return solveForHumn(expr.right, constant / expr.left.value)
      case '/': return { err: 'variable in denominator, no trivial simplification'} 
    }
  } else if (expr.right.type === 'literal') {
    // left + 2 = constant -> left = constant - 2
    // left - 2 = constant -> left = constant + 2
    // left * 2 = constant -> left = constant / 2
    // left / 2 = constant -> left = constant * 2
    switch (expr.op) {
      case '+': return solveForHumn(expr.left, constant - expr.right.value)
      case '-': return solveForHumn(expr.left, constant + expr.right.value)
      case '*': return solveForHumn(expr.left, constant / expr.right.value)
      case '/': return solveForHumn(expr.left, constant * expr.right.value)
    }
  } else {
    return { err: 'too many variables in left hand side'}
  }
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

  const root = simplify(bindingsMap, 'root');
  if (root.type !== 'expression') {
    return { err: 'root isn\'t an expression' }
  }

  // root.op = '=' as Op; // Cheating to make the print nicer
  // console.log(pprint(root));

  if (root.left.type === 'literal') {
    return mapOk(solveForHumn(root.right, root.left.value), x => x.toString());
  } else if (root.right.type === 'literal') {
    return mapOk(solveForHumn(root.left, root.right.value), x => x.toString())
  }

  return { err: "Too many variables in expression" };
}
