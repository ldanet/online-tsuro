import { memo, ReactNode } from "react";
import { bg, color, Combination, edge, Pair } from "../constants/tiles";

type LineType = "ab" | "ac" | "ad" | "ae" | "af" | "ag" | "ah";

const pairToLine: { [key in Pair]: { type: LineType; transform?: string } } = {
  "01": { type: "ab" },
  "02": { type: "ac" },
  "03": { type: "ad" },
  "04": { type: "ae" },
  "05": { type: "af" },
  "06": { type: "ag" },
  "07": { type: "ah" },

  "12": { type: "ah", transform: "scale(-1 1) translate(-30)" },
  "13": { type: "ag", transform: "scale(-1 1) translate(-30)" },
  "14": { type: "af", transform: "scale(-1 1) translate(-30)" },
  "15": { type: "ae", transform: "scale(-1 1) translate(-30)" },
  "16": { type: "ad", transform: "scale(-1 1) translate(-30)" },
  "17": { type: "ac", transform: "scale(-1 1) translate(-30)" },

  "23": { type: "ab", transform: "rotate(-90 15 15)" },
  "24": { type: "ac", transform: "rotate(-90 15 15)" },
  "25": { type: "ad", transform: "rotate(-90 15 15)" },
  "26": { type: "ae", transform: "rotate(-90 15 15)" },
  "27": { type: "af", transform: "rotate(-90 15 15)" },

  "34": {
    type: "ah",
    transform: "rotate(-90 15 15) scale(-1 1) translate(-30)",
  },
  "35": {
    type: "ag",
    transform: "rotate(-90 15 15) scale(-1 1) translate(-30)",
  },
  "36": {
    type: "af",
    transform: "rotate(-90 15 15) scale(-1 1) translate(-30)",
  },
  "37": {
    type: "ae",
    transform: "rotate(-90 15 15) scale(-1 1) translate(-30)",
  },

  "45": { type: "ab", transform: "rotate(180 15 15)" },
  "46": { type: "ac", transform: "rotate(180 15 15)" },
  "47": { type: "ad", transform: "rotate(180 15 15)" },

  "56": {
    type: "ah",
    transform: "rotate(180 15 15) scale(-1 1) translate(-30)",
  },
  "57": {
    type: "ag",
    transform: "rotate(180 15 15) scale(-1 1) translate(-30)",
  },

  "67": { type: "ab", transform: "rotate(90 15 15)" },
};

const lineTypeToPath: { [key in LineType]: string } = {
  ab: "M9 30C9 22 21 22 21 30",
  ac: "M9 30C9 22 22 21 30 21",
  ad: "M9 30C9 22 22 9 30 9",
  ae: "M9 30C9 22 21 8 21 0",
  af: "M9 30L9 0",
  ag: "M9 30C9 22 8 9 0 9",
  ah: "M9 30C9 26 6 21 0 21",
};

type LineProps = { pair: keyof typeof pairToLine };

const Line = ({ pair }: LineProps) => {
  const { type, transform } = pairToLine[pair];
  return (
    <path
      d={lineTypeToPath[type]}
      transform={transform}
      opacity="1"
      fillOpacity="0"
      stroke={color}
      strokeWidth="1"
      strokeOpacity="1"
    />
  );
};

type TileProps = { combination: Combination };

const Tile = ({ combination }: TileProps) => {
  return (
    <div>
      <svg
        viewBox="0 0 30 30"
        xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: bg, width: "100%", height: "100%" }}
      >
        <g>
          {combination.map((pair) => (
            <Line key={pair} pair={pair} />
          ))}
          <path d="M0 0L30 0L30 30L0 30 z" fill="none" stroke={edge} />
        </g>
      </svg>
    </div>
  );
};

export default memo(Tile);
