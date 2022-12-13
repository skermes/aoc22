export type Result<T, E> = { ok: T } | { err: E };
export function isOk<T, _>(result: any): result is { ok: T } {
  return result.ok !== undefined;
}

declare global {
  interface Array<T> {
    mapFallible<T2, E>(fn: (val: T) => Result<T2, E>): Result<Array<T2>, E>;

    forEachFallible<E>(fn: (val: T) => Result<null, E>): Result<null, E>;

    reductions<T2>(fn: (acc: T2, val: T, i: number) => T2, initial?: T2): Array<T2>;

    minBy(fn: (value: T) => number): T | undefined;
  }
}

Array.prototype.mapFallible = function <T, T2, E>(fn: (val: T) => Result<T2, E>): Result<Array<T2>, E> {
  const outVals = [];
  for (var inVal of this) {
    const result = fn(inVal);
    if (isOk(result)) {
      outVals.push(result.ok);
    } else {
      return result;
    }
  }
  return { ok: outVals };
};

Array.prototype.forEachFallible = function <T, E>(fn: (val: T) => Result<null, E>): Result<null, E> {
  for (var i = 0; i < this.length; i++) {
    const result = fn(this[i]);
    if (!isOk(result)) {
      return result;
    }
  }
  return { ok: null };
};

Array.prototype.reductions = function <T, T2>(fn: (acc: T2, value: T, i: number) => T2, initial?: T2): Array<T2> {
  const output = initial === undefined ? [this[0]] : [initial];
  const list = initial === undefined ? this.slice(1) : this;

  list.forEach((val, i) => output.push(fn(output[output.length - 1], val, i)));

  return output;
};

Array.prototype.minBy = function <T>(fn: (value: T) => number): T | undefined {
  var minScore = Infinity;
  var minValue = undefined;
  this.forEach((value) => {
    const score = fn(value);
    if (score < minScore) {
      minScore = score;
      minValue = value;
    }
  });

  return minValue;
};

export function zip2<T1, T2>(as: Array<T1>, bs: Array<T2>): Array<[T1, T2]> {
  const output = [];
  const len = Math.min(as.length, bs.length);

  for (var i = 0; i < len; i++) {
    // Len is the min of the lengths, so we know these indexes are safe as the casts should all be fine.
    const outval = [as[i] as T1, bs[i] as T2] as [T1, T2];
    output.push(outval);
  }

  return output;
}

export function zip4<T1, T2, T3, T4>(
  as: Array<T1>,
  bs: Array<T2>,
  cs: Array<T3>,
  ds: Array<T4>
): Array<[T1, T2, T3, T4]> {
  return zip2(zip2(as, bs), zip2(cs, ds)).map(([[a, b], [c, d]]) => [a, b, c, d]);
}
