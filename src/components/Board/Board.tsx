import { Fragment, memo } from "react";
import { GameEdge } from "../Edge/Edge";
import { useEngine } from "../../engine/store";
import Tile from "../Tile/Tile";
import { GamePlayers } from "../Players/Players";
import { getTranslate } from "../../utils/math";
import ColorPicker from "../ColorPicker/ColorPicker";
import { getBoard, getIsMyTurn, getPhase } from "../../engine/selectors";
import SelectedTile from "../SelectedTile/SelectedTile";

const PickNotchPrompt = () => (
  <foreignObject x={20} y={20} width={150} height={150}>
    <div className="flex h-full w-full items-center justify-items-center text-center text-xs">
      <p>
        It&apos;s your turn!
        <br /> Pick a notch on the edge of the board
      </p>
    </div>
  </foreignObject>
);

const Board = () => {
  const board = useEngine(getBoard);
  const gamePhase = useEngine(getPhase);
  const isMyTurn = useEngine(getIsMyTurn);

  return (
    <svg
      viewBox="0 0 190 190"
      className="m-4 h-[--board-size] w-[--board-size] rounded-xl border-2 border-orange-800 bg-board"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
    >
      {new Array(6).fill(true).map((_, i) => (
        <GameEdge key={i} type="top" row={-1} col={i} index={23 - i} />
      ))}
      {new Array(6).fill(true).map((_, i) => (
        <GameEdge key={i} type="bottom" row={6} col={i} index={6 + i} />
      ))}
      {board.map((row, ri) => (
        <Fragment key={ri}>
          <GameEdge type="left" row={ri} col={-1} index={ri} />
          <GameEdge type="right" row={ri} col={6} index={17 - ri} />
          <g className="drop-shadow-tile">
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
      {isMyTurn && gamePhase === "round1" && <PickNotchPrompt />}
      <GamePlayers />
    </svg>
  );
};

export default memo(Board);
