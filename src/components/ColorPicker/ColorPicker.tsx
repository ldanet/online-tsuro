import { memo, useCallback } from "react";
import { colors } from "../../engine/constants";
import {
  getAvailableColors,
  getHaspickedColors,
  getIsLoading,
  getMyPlayer,
  getPickColor,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { PlayerColor } from "../../engine/types";
import { getTranslateValue } from "../../utils/math";
import { cn } from "../../utils/styles";
import styles from "./ColorPicker.module.css";

const ColorPicker = () => {
  const availableColors = useEngine(getAvailableColors);
  const hasPickedColor = useEngine(getHaspickedColors);
  const myPlayer = useEngine(getMyPlayer);
  const pickColor = useEngine(getPickColor);
  const isLoading = useEngine(getIsLoading);

  const handleClick = useCallback(
    (color: PlayerColor) => {
      pickColor(myPlayer, color);
    },
    [pickColor, myPlayer]
  );

  if (isLoading || hasPickedColor) return null;
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
        {colors.map((color, i) => {
          const x = i % 4;
          const row = Math.ceil((i - x) / 4) + 1;
          const offset = row === 3 ? 2 : 1;
          const col = x + offset;
          return (
            <circle
              className={cn(
                styles.token,
                styles[`token_${color}`],
                availableColors.includes(color) ? styles.token__clickable : ""
              )}
              key={color}
              cx={getTranslateValue(col) + 15}
              cy={getTranslateValue(row) + 15}
              r="5"
              onClick={
                availableColors.includes(color)
                  ? handleClick.bind(null, color)
                  : undefined
              }
            />
          );
        })}
      </g>
    </>
  );
};

export default memo(ColorPicker);
