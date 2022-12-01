export type Result<T, E> = { ok: T } | { err: E };
export function isOk<T, _>(result: any): result is { ok: T } {
  return !!result.ok
}