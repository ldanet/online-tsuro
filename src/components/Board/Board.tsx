import { Fragment, memo, useCallback } from "react";
import { Edge, EdgeType } from "../Edge/Edge";
import { useEngine } from "../../engine/store";
import Tile from "../Tile/Tile";
import Players from "../Players/Players";
import { getTranslate } from "../../utils/math";
import ColorPicker from "../ColorPicker/ColorPicker";
import { getBoard, getPhase } from "../../engine/selectors";
import SelectedTile from "../SelectedTile/SelectedTile";
import { Notch } from "../../constants/tiles";

type BoardEdgeProps = {
  type: EdgeType;
  row: number;
  col: number;
  /** Used to animate notches in sequence */
  index: number;
};

// Keeps the Edge component decoupled from the engine
const BoardEdge = ({ type, row, col, index }: BoardEdgeProps) => {
  const [isClickable, myPlayer] = useEngine(
    useCallback(({ gamePhase, myPlayer, playerTurnsOrder }) => {
      return [
        gamePhase === "round1" && myPlayer === playerTurnsOrder[0],
        myPlayer,
      ] as const;
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
  return (
    <Edge
      type={type}
      row={row}
      col={col}
      index={index}
      isClickable={isClickable}
      handleClick={handleClick}
    />
  );
};

const Board = () => {
  const board = useEngine(getBoard);
  const gamePhase = useEngine(getPhase);

  return (
    <svg
      viewBox="0 0 190 190"
      className="m-4 h-[--board-size] w-[--board-size] bg-board"
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
        <BoardEdge key={i} type="top" row={-1} col={i} index={23 - i} />
      ))}
      {new Array(6).fill(true).map((_, i) => (
        <BoardEdge key={i} type="bottom" row={6} col={i} index={6 + i} />
      ))}
      {board.map((row, ri) => (
        <Fragment key={ri}>
          <BoardEdge type="left" row={ri} col={-1} index={ri} />
          <BoardEdge type="right" row={ri} col={6} index={17 - ri} />
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
