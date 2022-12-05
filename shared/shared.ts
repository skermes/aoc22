export type Result<T, E> = { ok: T } | { err: E };
export function isOk<T, _>(result: any): result is { ok: T } {
  return result.ok !== undefined;
}

declare global {
  interface Array<T> {
    mapFallible<T2, E>(fn: (val: T) => Result<T2, E>): Result<Array<T2>, E>;

    forEachFallible<E>(fn: (val: T) => Result<null, E>): Result<null, E>;
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
