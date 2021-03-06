import { Fragment, memo, useCallback } from "react";
import { Edge, EdgeType } from "../Edge/Edge";
import { useEngine } from "../../engine/store";
import Tile from "../Tile/Tile";
import styles from "./Board.module.css";
import Players from "../Players/Players";
import { getTranslate } from "../../utils/math";
import ColorPicker from "../ColorPicker/ColorPicker";
import { getBoard, getPhase } from "../../engine/selectors";
import { Notch } from "../../constants/tiles";
import SelectedTile from "../SelectedTile/SelectedTile";

type BoardEdgeProps = {
  type: EdgeType;
  row: number;
  col: number;
};

const BoardEdge = ({ type, row, col }: BoardEdgeProps) => {
  const [isClickable, myPlayer] = useEngine(
    useCallback(({ gamePhase, myPlayer, playerTurnsOrder }) => {
      return [
        gamePhase === "round1" && myPlayer === playerTurnsOrder[0],
        myPlayer,
      ];
    }, [])
  );
  const placePlayer = useEngine(
    useCallback(({ placePlayer }) => placePlayer, [])
  );
  const handleClick = useCallback(
    (notch: Notch) => {
      placePlayer(myPlayer, { row, col, notch });
    },
    [row, col, myPlayer, placePlayer]
  );
  const clickableProps = isClickable
    ? { isClickable, onClick: handleClick }
    : {};
  return (
    <Edge type={type} transform={getTranslate(row, col)} {...clickableProps} />
  );
};

const Board = () => {
  const board = useEngine(getBoard);
  const gamePhase = useEngine(getPhase);

  return (
    <svg viewBox="0 0 190 190" className={styles.board}>
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
        <BoardEdge key={i} type="top" row={-1} col={i} />
      ))}
      {new Array(6).fill(true).map((_, i) => (
        <BoardEdge key={i} type="bottom" row={6} col={i} />
      ))}
      {board.map((row, ri) => (
        <Fragment key={ri}>
          <BoardEdge type="left" row={ri} col={-1} />
          <BoardEdge type="right" row={ri} col={6} />
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
