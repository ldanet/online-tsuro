import { Coordinate, Notch } from "./types";
import { Combination } from "../constants/tiles";

export const getNextTileCoordinate = ({
  row,
  col,
  notch,
}: Coordinate): Coordinate => {
  console.log("row,  col,  notch,: ", row, col, notch);

  switch (notch) {
    case "0":
      return { row: row + 1, col, notch: "5" };
    case "1":
      return { row: row + 1, col, notch: "4" };
    case "2":
      return { row, col: col + 1, notch: "7" };
    case "3":
      return { row, col: col + 1, notch: "6" };
    case "4":
      return { row: row - 1, col, notch: "1" };
    case "5":
      return { row: row - 1, col, notch: "0" };
    case "6":
      return { row, col: col - 1, notch: "3" };
    case "7":
      return { row, col: col - 1, notch: "2" };
  }
};

export const getNextNotch = (notch: Notch, combination: Combination): Notch => {
  const pair = combination.find((p) => p.includes(notch));
  return pair?.replace(notch, "") as Notch;
};

export const shuffle = <T extends any>(a: T[]): T[] => {
  const array = [...a];
  let curr = array.length;

  // While there remain elements to shuffle…
  while (curr > 0) {
    // Pick a remaining element…
    const i = Math.floor(Math.random() * curr--);

    // And swap it with the current element.
    [array[i], array[curr]] = [array[curr], array[i]];
  }

  return array;
};
