import { isOk, Result } from "../shared/shared";

export const name = "Monkey in the Middle";

type Term = "old" | number;
type Op = "*" | "+";
type Expr = { op: Op; left: Term; right: Term };

function parseTerm(token: string | undefined) {
  if (token === "old") {
    return { ok: "old" as Term };
  } else if (token === undefined) {
    return { err: `term is undefined` };
  } else {
    return { ok: Number.parseInt(token) };
  }
}

function parseOp(token: string | undefined) {
  if (token === "+" || token === "*") {
    return { ok: token as Op };
  } else {
    return { err: `badOp ${token}` };
  }
}

function parseExpr(text: string) {
  const tokens = text.split(" ");
  const left = parseTerm(tokens[0]);
  const op = parseOp(tokens[1]);
  const right = parseTerm(tokens[2]);

  if (!isOk(left)) {
    return left;
  }

  if (!isOk(op)) {
    return op;
  }

  if (!isOk(right)) {
    return right;
  }

  return { ok: { left: left.ok, op: op.ok, right: right.ok } };
}

function termValue(term: Term, old: number) {
  return term === "old" ? old : term;
}

function evaluate(expr: Expr, old: number) {
  switch (expr.op) {
    case "+": {
      return termValue(expr.left, old) + termValue(expr.right, old);
    }
    case "*": {
      return termValue(expr.left, old) * termValue(expr.right, old);
    }
  }
}

type Monkey = {
  index: number;
  items: number[];
  update: Expr;
  divisor: number;
  trueTarget: number;
  falseTarget: number;
  itemsInspected: number;
};

function parseMonkey(text: string): Result<Monkey, string> {
  const [header, starting, operation, test, ifTrue, ifFalse] = text.split("\n");
  if (!header || !starting || !operation || !test || !ifTrue || !ifFalse) {
    return { err: `badParse ${text}` };
  }

  const index = Number.parseInt(header.slice(7, header.length - 1));
  const items = starting
    .slice(18)
    .split(", ")
    .map((token) => Number.parseInt(token));

  const update = parseExpr(operation.slice(19));
  if (!isOk(update)) {
    return update;
  }

  const divisor = Number.parseInt(test.slice(21));
  const trueTarget = Number.parseInt(ifTrue.slice(29));
  const falseTarget = Number.parseInt(ifFalse.slice(30));

  return {
    ok: {
      index,
      items,
      update: update.ok,
      divisor,
      trueTarget,
      falseTarget,
      itemsInspected: 0,
    },
  };
}

function round(monkeys: Monkey[], worryFactor: number, wholeMonkeyModulus: number) {
  monkeys.forEach((monkey) => {
    monkey.itemsInspected += monkey.items.length;
    monkey.items.forEach((item) => {
      const newValue = Math.floor(evaluate(monkey.update, item) / worryFactor) % wholeMonkeyModulus;
      if (newValue % monkey.divisor === 0) {
        monkeys[monkey.trueTarget]?.items.push(newValue);
      } else {
        monkeys[monkey.falseTarget]?.items.push(newValue);
      }
    });
    monkey.items = [];
  });
}

function rounds(monkeys: Monkey[], worryFactor: number, count: number) {
  // We don't actually care what the absolute value of our worry is, just what it is modulo each monkey's divisor.
  // Taking the value modulo the product of all divisors at each step preserves that property while keeping the
  // worry finite.
  const wholeMonkeyModulus = monkeys.map((monkey) => monkey.divisor).reduce((a, b) => a * b);
  for (var i = 0; i < count; i++) {
    round(monkeys, worryFactor, wholeMonkeyModulus);
  }
}

export function partOne(input: string): Result<string, string> {
  const monkeys = input.split("\n\n").mapFallible(parseMonkey);
  if (!isOk(monkeys)) {
    return monkeys;
  }

  rounds(monkeys.ok, 3, 20);

  const [secondMost, most] = monkeys.ok
    .sort((a, b) => a.itemsInspected - b.itemsInspected)
    .slice(monkeys.ok.length - 2);
  if (!secondMost || !most) {
    return { err: "notEnoughMonkeys" };
  }

  return { ok: (secondMost.itemsInspected * most.itemsInspected).toString() };
}

export function partTwo(input: string): Result<string, string> {
  const monkeys = input.split("\n\n").mapFallible(parseMonkey);
  if (!isOk(monkeys)) {
    return monkeys;
  }

  rounds(monkeys.ok, 1, 10_000);

  const [secondMost, most] = monkeys.ok
    .sort((a, b) => a.itemsInspected - b.itemsInspected)
    .slice(monkeys.ok.length - 2);
  if (!secondMost || !most) {
    return { err: "notEnoughMonkeys" };
  }

  return { ok: (secondMost.itemsInspected * most.itemsInspected).toString() };
}
