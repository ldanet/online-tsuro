export function hasProperty<T extends string>(
  value: unknown,
  key: T
): value is { [key in T]: unknown } {
  if (value && (value as { [key in T]: unknown })[key] !== undefined) {
    return true;
  }
  return false;
}
