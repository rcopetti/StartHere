/**
 * Firestore Value Helpers
 * Firestore rejects `undefined` field values by default. Strip them before
 * every write so optional profile fields can stay optional in TypeScript.
 */

export function withoutUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => withoutUndefined(entry)) as unknown as T;
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, withoutUndefined(entry)])
    ) as T;
  }

  return value;
}
