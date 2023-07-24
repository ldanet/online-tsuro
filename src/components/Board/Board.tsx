import { Fragment, memo, useCallback } from "react";
import { Edge, EdgeType } from "../Edge/Edge";
import { useEngine } from "../../engine/store";
import Tile from "../Tile/Tile";
import styles from "./Board.module.css";
import Players from "../Players/Players";
import { getTranslate } from "../../utils/math";
import ColorPicker from "../ColorPicker/ColorPicker";
import { getBoard, getPhase } from "../../engine/selectors";
import SelectedTile from "../SelectedTile/SelectedTile";

const Board = () => {
  const board = useEngine(getBoard);
  const gamePhase = useEngine(getPhase);

  return (
    <svg
      viewBox="0 0 190 190"
      className={styles.board}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
    >
      <defs>
        <filter id="tile-shadow" colorInterpolationFilters="sRGB">
          <feDropShadow
            dx="0.2"
            dy="0.2"
            stdDeviation=".3"
            floodOpacity="0.5"
          />
        </filter>
      </defs>
      {new Array(6).fill(true).map((_, i) => (
        <Edge key={i} type="top" row={-1} col={i} index={23 - i} />
      ))}
      {new Array(6).fill(true).map((_, i) => (
        <Edge key={i} type="bottom" row={6} col={i} index={6 + i} />
      ))}
      {board.map((row, ri) => (
        <Fragment key={ri}>
          <Edge type="left" row={ri} col={-1} index={ri} />
          <Edge type="right" row={ri} col={6} index={17 - ri} />
          <g filter="url(#tile-shadow)">
            {row.map((col, ci) => {
              return (
                col && (
                  <Tile
                    key={`${ri}-${ci}`}
                    combination={col.combination}
                    transform={getTranslate(ri, ci)}
                  />
                )
              );
            })}
          </g>
        </Fragment>
      ))}
      <SelectedTile />
      {gamePhase === "joining" && <ColorPicker />}
      <Players />
    </svg>
  );
};

export default memo(Board);
