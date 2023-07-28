import { motion, Variant } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Notch } from "../../constants/tiles";
import { getTranslate } from "../../utils/math";

export type EdgeType = "top" | "bottom" | "left" | "right";

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

const typeToNotches = {
  top: ["0", "1"],
  left: ["2", "3"],
  bottom: ["4", "5"],
  right: ["6", "7"],
} as const;

const boardAnimationLength = 2;
const timePerNotch = boardAnimationLength / 24;
const initialDelay = 2;

type Variants = {
  still: Variant;
  blink: Variant;
  hover: Variant;
};
type VariantKey = keyof Variants;

const animationVariants: Variants = {
  still: {
    scale: 1,
    opacity: 1,
  },
  hover: {
    scale: [null, 1.5],
    opacity: 1,
  },
  blink: (delay: number) => {
    return {
      scale: [1, 0.2, 1.2, 1],
      opacity: [1, 0.2, 1, 1],
      transition: {
        delay,
      },
    };
  },
};

type ClickableProps =
  | {
      isClickable: true;
      handleClick: (notch: Notch) => void;
    }
  | {
      isClickable?: false;
      handleClick?: (notch: Notch) => void;
    };

type NotchProps = {
  notch: Notch;
  delay: number;
} & ClickableProps;

const Notch = ({ notch, delay, isClickable, handleClick }: NotchProps) => {
  const [variant, setVariant] = useState<VariantKey>("still");

  useEffect(() => {
    setVariant(isClickable ? "blink" : "still");
  }, [isClickable]);

  const handleHoverStart = useCallback(() => {
    if (isClickable) setVariant("hover");
  }, [isClickable]);

  const handleHoverEnd = useCallback(() => {
    setVariant("still");
  }, []);

  return (
    <motion.g
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      animate={variant}
      initial="still"
      onClick={handleClick?.bind(null, notch)}
    >
      <motion.path
        className="fill-none stroke-tile-line"
        variants={animationVariants}
        custom={delay}
        transition={{
          scale: {
            type: "spring",
          },
        }}
        d={paths[notch]}
      />
      {isClickable && (
        <path
          className="cursor-pointer fill-transparent stroke-none"
          d={clickablePaths[notch]}
        />
      )}
    </motion.g>
  );
};

type EdgeProps = {
  type: EdgeType;
  row: number;
  col: number;
  /** Used to animate notches in sequence */
  index: number;
} & ClickableProps;

export const Edge = ({
  type,
  row,
  col,
  index,
  ...clickableProps
}: EdgeProps) => {
  const notchIndex = index * 2;
  const delayFirst = initialDelay + (notchIndex + 1) * timePerNotch;
  const delaySecond = initialDelay + notchIndex * timePerNotch;

  const delays = [delayFirst, delaySecond];

  return (
    <motion.g transform={getTranslate(row, col)}>
      {typeToNotches[type].map((notch, i) => (
        <Notch
          key={notch}
          notch={notch}
          delay={delays[i]}
          {...clickableProps}
        />
      ))}
    </motion.g>
  );
};
