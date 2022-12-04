export type Result<T, E> = { ok: T } | { err: E };
export function isOk<T, _>(result: any): result is { ok: T } {
  return !!result.ok;
}

declare global {
  interface Array<T> {
    mapFallible<T2, E>(fn: (val: T) => Result<T2, E>): Result<Array<T2>, E>;
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
