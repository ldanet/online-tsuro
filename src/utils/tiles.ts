import { ColoredPair, Notch, notchCoordinates } from "../constants/tiles";

type LineType = "U" | "J" | "C" | "S" | "I" | "L" | "c";

const lineTypeToPath: { [key in LineType]: string } = {
  U: "M9 30C9 22 21 22 21 30", // U
  J: "M9 30C9 22 22 21 30 21", // short end of curve
  C: "M9 30C9 22 22 9 30 9", // C
  S: "M9 30C9 22 21 8 21 0", // S
  I: "M9 30L9 0", // I
  L: "M9 30C9 22 8 9 0 9", // Long end of curve
  c: "M9 30C9 26 6 21 0 21", // c
};

const notchesToLineType: { [n1 in Notch]: { [n2 in Notch]: LineType } } = {
  "0": {
    "0": "U",
    "1": "U",
    "2": "J",
    "3": "C",
    "4": "S",
    "5": "I",
    "6": "L",
    "7": "c",
  },
  "1": {
    "0": "U",
    "1": "U",
    "2": "c",
    "3": "L",
    "4": "I",
    "5": "S",
    "6": "C",
    "7": "J",
  },
  "2": {
    "0": "L",
    "1": "c",
    "2": "U",
    "3": "U",
    "4": "J",
    "5": "C",
    "6": "S",
    "7": "I",
  },
  "3": {
    "0": "C",
    "1": "J",
    "2": "U",
    "3": "U",
    "4": "c",
    "5": "L",
    "6": "I",
    "7": "S",
  },
  "4": {
    "0": "S",
    "1": "I",
    "2": "L",
    "3": "c",
    "4": "U",
    "5": "U",
    "6": "J",
    "7": "C",
  },
  "5": {
    "0": "I",
    "1": "S",
    "2": "C",
    "3": "J",
    "4": "U",
    "5": "U",
    "6": "c",
    "7": "L",
  },
  "6": {
    "0": "J",
    "1": "C",
    "2": "S",
    "3": "I",
    "4": "L",
    "5": "c",
    "6": "U",
    "7": "U",
  },
  "7": {
    "0": "c",
    "1": "L",
    "2": "I",
    "3": "S",
    "4": "C",
    "5": "J",
    "6": "U",
    "7": "U",
  },
};

export const notchToTransform = {
  "0": { flip: false, rotation: 0 },
  "1": { flip: true, rotation: 0 },
  "2": { flip: false, rotation: 90 },
  "3": { flip: true, rotation: 90 },
  "4": { flip: false, rotation: 180 },
  "5": { flip: true, rotation: 180 },
  "6": { flip: false, rotation: -90 },
  "7": { flip: true, rotation: -90 },
};

const typeToCoords: {
  [k in LineType]: { op: string; coords: [number, number][] };
} = {
  U: {
    op: "C",
    coords: [
      [9, 22],
      [21, 22],
      [21, 30],
    ],
  },
  J: {
    op: "C",
    coords: [
      [9, 22],
      [22, 21],
      [30, 21],
    ],
  },
  C: {
    op: "C",
    coords: [
      [9, 22],
      [22, 9],
      [30, 9],
    ],
  },
  S: {
    op: "C",
    coords: [
      [9, 22],
      [21, 8],
      [21, 0],
    ],
  },
  I: { op: "L", coords: [[9, 0]] },
  L: {
    op: "C",
    coords: [
      [9, 22],
      [8, 9],
      [0, 9],
    ],
  },
  c: {
    op: "C",
    coords: [
      [9, 26],
      [6, 21],
      [0, 21],
    ],
  },
};

const doRotate = (
  [xIn, yIn]: [number, number],
  angle: number
): [number, number] => {
  if (angle === 0) return [xIn, yIn];
  const [x, y] = [xIn - 15, yIn - 15];
  switch (angle) {
    case 90:
      return [y + 15, -x + 15];
    case -90:
      return [-y + 15, x + 15];
    case 180:
      return [-x + 15, -y + 15];
    default:
      return [xIn, yIn];
  }
};

const doFlip = ([x, y]: [number, number]): [number, number] => [30 - x, y];

export const getPath = (pair: ColoredPair) => {
  const [n1, n2] = pair as unknown as Notch[];
  const c1 = notchCoordinates[n1];
  const lineType = notchesToLineType[n1][n2];
  const { coords, op } = typeToCoords[lineType];
  const { flip, rotation } = notchToTransform[n1];
  return coords.reduce((p, coords) => {
    let c = coords;
    if (flip) {
      c = doFlip(c);
    }
    c = doRotate(c, rotation);
    return `${p}${c[0]} ${c[1]} `;
  }, `M${c1.x} ${c1.y}${op}`);
};
