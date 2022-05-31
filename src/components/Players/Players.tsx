import { memo } from "react";
import { notchCoordinates } from "../../constants/tiles";
import { getPlayers } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";
import { getTranslateValue } from "../../utils/math";
import { cn } from "../../utils/styles";
import styles from "./Players.module.css";

const Players = () => {
  const players = useEngine(getPlayers);
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
