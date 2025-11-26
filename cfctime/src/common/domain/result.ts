// Result<T, E>
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T, E = never>(value: T): Result<T, E> => ({
  ok: true,
  value,
});

export const Err = <T = never, E = unknown>(error: E): Result<T, E> => ({
  ok: false,
  error,
});

// Option<T>
export type Option<T> = T | null;