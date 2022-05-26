import styles from "./Edge.module.css";

type EdgeProps = {
  type: "top" | "bottom" | "left" | "right";
  transform?: string;
};

const paths = {
  top: ["M9 2.5L9 5", "M21 2.5L21 5"],
  bottom: ["M9 0L9 2.5", "M21 0L21 2.5"],
  left: ["M2.5 9L5 9", "M2.5 21L5 21"],
  right: ["M0 9L2.5 9", "M0 21L2.5 21"],
};

export const Edge = ({ type, transform }: EdgeProps) => {
  return (
    <g transform={transform}>
      <path className={styles.notch} d={paths[type][0]} />
      <path className={styles.notch} d={paths[type][1]} />
    </g>
  );
};
