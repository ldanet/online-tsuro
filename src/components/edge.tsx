import { bg, color } from "../constants/tiles";

type EdgeProps = {
  type: "top" | "bottom" | "left" | "right";
};

const paths = {
  top: ["M9 2.5L9 5", "M21 2.5L21 5"],
  bottom: ["M9 0L9 2.5", "M21 0L21 2.5"],
  left: ["M2.5 9L5 9", "M2.5 21L5 21"],
  right: ["M0 9L2.5 9", "M0 21L2.5 21"],
};

const viewBoxes = {
  top: "0 0 30 5",
  bottom: "0 0 30 5",
  left: "0 0 5 30",
  right: "0 0 5 30",
};

export const Edge = ({ type }: EdgeProps) => {
  return (
    <div>
      <svg
        viewBox={viewBoxes[type]}
        xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: bg, width: "100%", height: "100%" }}
      >
        <path stroke={color} d={paths[type][0]} />
        <path stroke={color} d={paths[type][1]} />
      </svg>
    </div>
  );
};

export const Corner = () => (
  <div>
    <svg
      viewBox="0 0 5 5"
      xmlns="http://www.w3.org/2000/svg"
      style={{ backgroundColor: bg, width: "100%", height: "100%" }}
    ></svg>
  </div>
);
