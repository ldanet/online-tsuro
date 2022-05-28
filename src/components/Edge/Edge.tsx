import { Notch } from "../../engine/types";
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
  "0": "M9 27.5L9 30",
  "1": "M21 27.5L21 30",
  "2": "M27.5 21L30 21",
  "3": "M27.5 9L30 9",
  "4": "M21 0L21 2.5",
  "5": "M9 0L9 2.5",
  "6": "M0 9L2.5 9",
  "7": "M0 21L2.5 21",
};

const clickablePaths = {
  "0": "M0 30L15 30L15 25L0 25 z",
  "1": "M30 30L15 30L15 25L30 25 z",
  "2": "M30 30L30 15L25 15L25 30 z",
  "3": "M30 0L30 15L25 15L25 0 z",
  "4": "M30 0L15 0L15 5L30 5 z",
  "5": "M0 0L15 0L15 5L0 5 z",
  "6": "M0 0L0 15L5 15L5 0 z",
  "7": "M0 30L0 15L5 15L5 30 z",
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
