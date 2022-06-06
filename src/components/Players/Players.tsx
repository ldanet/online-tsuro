import { motion, AnimatePresence } from "framer-motion";
import { Variants } from "framer-motion/types/types";
import { memo, useEffect, useRef, useState } from "react";
import { getPath, Notch, notchCoordinates } from "../../constants/tiles";
import { getColoredPaths, getPlayers } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import {
  ColoredPath,
  Coordinate,
  Player,
  PlayerColor,
} from "../../engine/types";
import { getAllPlayerCoordinates } from "../../engine/utils";
import { getTranslate, getTranslateValue } from "../../utils/math";
import { cn } from "../../utils/styles";
import styles from "./Players.module.css";

const ANIMATION_DURATION = 0.3;

const coloredLineAnimationVariants: Variants = {
  hidden: { pathLength: 0 },
  show: { pathLength: 1 },
};

const ColoredLine = ({ pair, color, row, col }: ColoredPath) => {
  return (
    <>
      <motion.path
        key={`path-${color}-${pair}-${col}-${row}-shadow`}
        className={styles.line_colored}
        d={getPath(pair)}
        transform={getTranslate(row, col)}
        variants={coloredLineAnimationVariants}
        transition={{ duration: ANIMATION_DURATION, ease: "linear" }}
        initial="hidden"
        animate="show"
      />
      <motion.path
        key={`path-${color}-${pair}-${col}-${row}-color`}
        className={styles[`line_${color}`]}
        d={getPath(pair)}
        transform={getTranslate(row, col)}
        variants={coloredLineAnimationVariants}
        transition={{ duration: ANIMATION_DURATION }}
        initial="hidden"
        animate="show"
      />
    </>
  );
};

const Players = () => {
  const players = useEngine(getPlayers);
  const coloredPaths = useEngine(getColoredPaths);

  const isAnimating = useRef(false);
  const [existingPaths, setExistingPaths] = useState(coloredPaths);
  const [movingColor, setMovingColor] = useState<PlayerColor>();

  useEffect(() => {
    if (coloredPaths.length > existingPaths.length) {
      const newPaths = coloredPaths.slice(0, existingPaths.length + 1);
      if (isAnimating.current) {
        setTimeout(() => {
          setExistingPaths(newPaths);
          setMovingColor(newPaths[existingPaths.length].color);
        }, ANIMATION_DURATION * 1000);
      } else {
        setExistingPaths(newPaths);
        setMovingColor(newPaths[existingPaths.length].color);
        isAnimating.current = true;
      }
    } else {
      isAnimating.current = false;
      setTimeout(() => {
        setMovingColor(undefined);
      }, ANIMATION_DURATION * 1000);
      setExistingPaths(coloredPaths);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coloredPaths, existingPaths]);

  const playerCoords = getAllPlayerCoordinates(players, existingPaths);

  return (
    <>
      <defs>
        <filter id="player-shadow" colorInterpolationFilters="sRGB">
          <feDropShadow
            dx="0.5"
            dy="0.5"
            stdDeviation=".5"
            floodOpacity="0.4"
          />
        </filter>
      </defs>
      <g>
        {existingPaths.map((p) => (
          <ColoredLine
            key={`path-${p.color}-${p.pair}-${p.col}-${p.row}`}
            {...p}
          />
        ))}
      </g>
      <g filter="url(#player-shadow)">
        {/* Workaround for the group to be the size of the board so the shadow doesn't get clipped */}
        <rect x={0} y={0} height={190} width={190} fill="none" stroke="none" />
        {players.map(({ name, status, color }) => {
          const coords = playerCoords[name];
          return coords && status === "playing" && movingColor !== color ? (
            <circle
              className={cn(styles.player, styles[`player_${color}`])}
              // initial={{ opacity: 0, scale: 1.5 }}
              // animate={{ opacity: 1, scale: 1 }}
              // exit={{ opacity: 0, scale: 1.5 }}
              // transition={{ duration: 0.4 }}
              key={name}
              cx={
                getTranslateValue(coords.col) + notchCoordinates[coords.notch].x
              }
              cy={
                getTranslateValue(coords.row) + notchCoordinates[coords.notch].y
              }
              r="3"
            />
          ) : null;
        })}
      </g>
    </>
  );
};

export default memo(Players);
