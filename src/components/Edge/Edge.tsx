import { Notch } from "../../constants/tiles";
import styles from "./Edge.module.css";

export type EdgeType = "top" | "bottom" | "left" | "right";

export type EdgeProps = Omit<JSX.IntrinsicElements["g"], "onClick"> & {
  type: EdgeType;
} & (
    | {
        isClickable?: false;
      }
    | { isClickable: true; onClick: (notch: Notch) => void }
  );

const paths = {
  "0": "M9 27.5L9 32.5",
  "1": "M21 27.5L21 32.5",
  "2": "M27.5 21L32.5 21",
  "3": "M27.5 9L32.5 9",
  "4": "M21 -2.5L21 2.5",
  "5": "M9 -2.5L9 2.5",
  "6": "M-2.5 9L2.5 9",
  "7": "M-2.5 21L2.5 21",
};

const clickablePaths = {
  "0": "M-2.5 32.5L15 32.5L15 25L-2.5 25 z",
  "1": "M32.5 32.5L15 32.5L15 25L32.5 25 z",
  "2": "M32.5 32.5L32.5 15L25 15L25 32.5 z",
  "3": "M32.5 -2.5L32.5 15L25 15L25 -2.5 z",
  "4": "M32.5 -2.5L15 -2.5L15 5L32.5 5 z",
  "5": "M-2.5 -2.5L15 -2.5L15 5L-2.5 5 z",
  "6": "M-2.5 -2.5L-2.5 15L5 15L5 -2.5 z",
  "7": "M-2.5 32.5L-2.5 15L5 15L5 32.5 z",
};

export const Edge = ({ type, transform, ...props }: EdgeProps) => {
  return (
    <g transform={transform}>
      {type === "top" && (
        <>
          <path className={styles.notch} d={paths["0"]} />
          <path className={styles.notch} d={paths["1"]} />
          {props.isClickable && (
            <>
              <path
                className={styles.clickable_notch}
                d={clickablePaths["0"]}
                onClick={props.onClick.bind(null, "0")}
              />
              <path
                className={styles.clickable_notch}
                d={clickablePaths["1"]}
                onClick={props.onClick.bind(null, "1")}
              />
            </>
          )}
        </>
      )}
      {type === "left" && (
        <>
          <path className={styles.notch} d={paths["2"]} />
          <path className={styles.notch} d={paths["3"]} />
          {props.isClickable && (
            <>
              <path
                className={styles.clickable_notch}
                d={clickablePaths["2"]}
                onClick={props.onClick.bind(null, "2")}
              />
              <path
                className={styles.clickable_notch}
                d={clickablePaths["3"]}
                onClick={props.onClick.bind(null, "3")}
              />
            </>
          )}
        </>
      )}
      {type === "bottom" && (
        <>
          <path className={styles.notch} d={paths["4"]} />
          <path className={styles.notch} d={paths["5"]} />
          {props.isClickable && (
            <>
              <path
                className={styles.clickable_notch}
                d={clickablePaths["4"]}
                onClick={props.onClick.bind(null, "4")}
              />
              <path
                className={styles.clickable_notch}
                d={clickablePaths["5"]}
                onClick={props.onClick.bind(null, "5")}
              />
            </>
          )}
        </>
      )}
      {type === "right" && (
        <>
          <path className={styles.notch} d={paths["6"]} />
          <path className={styles.notch} d={paths["7"]} />
          {props.isClickable && (
            <>
              <path
                className={styles.clickable_notch}
                d={clickablePaths["6"]}
                onClick={props.onClick.bind(null, "6")}
              />
              <path
                className={styles.clickable_notch}
                d={clickablePaths["7"]}
                onClick={props.onClick.bind(null, "7")}
              />
            </>
          )}
        </>
      )}
    </g>
  );
};
