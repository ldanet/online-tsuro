import { memo } from "react";
import { getPath, notchCoordinates } from "../../constants/tiles";
import { getColoredPaths, getPlayers } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { ColoredPath } from "../../engine/types";
import { getTranslate, getTranslateValue } from "../../utils/math";
import { cn } from "../../utils/styles";
import styles from "./Players.module.css";

const ColoredLine = ({ pair, color, row, col }: ColoredPath) => {
  return (
    <>
      <path
        className={styles.line_colored}
        d={getPath(pair)}
        transform={getTranslate(row, col)}
      />
      <path
        className={styles[`line_${color}`]}
        d={getPath(pair)}
        transform={getTranslate(row, col)}
      />
    </>
  );
};

const Players = () => {
  const players = useEngine(getPlayers);
  const coloredPaths = useEngine(getColoredPaths);
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
        {coloredPaths.map((p) => (
          <ColoredLine
            key={`path-${p.color}-${p.pair}-${p.col}-${p.row}`}
            {...p}
          />
        ))}
      </g>
      <g filter="url(#player-shadow)">
        {/* Workaround for the group to be the size of the board so the shadow doesn't get clipped */}
        <rect x={0} y={0} height={190} width={190} fill="none" stroke="none" />
        {players.map(({ coord, name, status, color }) =>
          coord && status === "playing" ? (
            <circle
              className={cn(styles.player, styles[`player_${color}`])}
              key={name}
              cx={
                getTranslateValue(coord.col) + notchCoordinates[coord.notch].x
              }
              cy={
                getTranslateValue(coord.row) + notchCoordinates[coord.notch].y
              }
              r="3"
            />
          ) : null
        )}
      </g>
    </>
  );
};

export default memo(Players);
