export function getNumber<T extends string>(
  obj: unknown,
  key: T
): number | undefined {
  if (hasProperty(obj, key)) {
    const val = obj[key];
    if (typeof val === "number") {
      return val;
    }
  }
  return undefined;
}

export function getBoolean<T extends string>(
  obj: unknown,
  key: T
): boolean | undefined {
  if (hasProperty(obj, key)) {
    const val = obj[key];
    if (typeof val === "boolean") {
      return val;
    }
  }
  return undefined;
}

export function hasProperty<T extends string>(
  value: unknown,
  key: T
): value is { [key in T]: unknown } {
  if ((value as { [key in T]: unknown })[key] !== undefined) {
    return true;
  }
  return false;
}
