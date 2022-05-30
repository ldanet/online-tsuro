export const cn = (...names: (string | undefined | false | null)[]) =>
  names.filter(Boolean).join(" ");
