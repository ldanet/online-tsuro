export const formatListHumanReadable = (originalList: string[]) => {
  const list = [...originalList];
  const last = list.shift();
  return [list.join(", "), last].filter(Boolean).join(" and ");
};
