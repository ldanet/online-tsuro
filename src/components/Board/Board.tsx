import { Fragment, memo, useCallback } from "react";
import { Edge, EdgeProps, EdgeType } from "../Edge/Edge";
import { useEngine } from "../../engine/store";
import { getNextTileCoordinate } from "../../engine/utils";
import Tile from "../Tile/Tile";
import styles from "./Board.module.css";
import { Combination, notchCoordinates } from "../../constants/tiles";
import { BoardTile, Notch } from "../../engine/types";

type BoardTileProps = {
  row: number;
  col: number;
  tile: BoardTile;
};

const BoardTile = ({ tile, row, col }: BoardTileProps) => {
  return (
    <Tile
      combination={tile.combination}
      coloredPairs={tile.coloredPairs}
      transform={`translate(${col * 30 + 5}, ${row * 30 + 5})`}
    />
  );
};

type BoardEdgeProps = {
  type: EdgeType;
  row: number;
  col: number;
};

const BoardEdge = ({ type, row, col }: BoardEdgeProps) => {
  const isClickable = useEngine(
    useCallback(({ gamePhase, myPlayer, playerTurnsOrder }) => {
      return gamePhase === "round1" && myPlayer === playerTurnsOrder[0];
    }, [])
  );
  const placePlayer = useEngine(
    useCallback(({ placePlayer }) => placePlayer, [])
  );
  const handleClick = useCallback(
    (notch: Notch) => {
      placePlayer({ row, col, notch });
    },
    [row, col, placePlayer]
  );
  const clickableProps = isClickable
    ? { isClickable, onClick: handleClick }
    : {};
  return (
    <Edge
      type={type}
      transform={`translate(${col * 30 + 5}, ${row * 30 + 5})`}
      {...clickableProps}
    />
  );
};

const Board = () => {
  const { board, selectedTile, selectedTileCoord, players } = useEngine(
    useCallback(
      ({ board, selectedTile, players, myPlayer }) => ({
        board,
        selectedTile,
        players: Object.values(players),
        selectedTileCoord:
          players[myPlayer]?.coord &&
          getNextTileCoordinate(players[myPlayer]?.coord!),
      }),
      []
    )
  );
  console.log("selectedTileCoord: ", selectedTileCoord);
  return (
    <svg viewBox="0 0 190 190" className={styles.board}>
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
          {row.map((col, ci) => {
            return col ? (
              <BoardTile key={`${ri}-${ci}`} tile={col} row={ri} col={ci} />
            ) : (
              selectedTile &&
                ri == selectedTileCoord?.row &&
                ci === selectedTileCoord?.col && (
                  <Tile
                    key={`${ri}-${ci}`}
                    combination={selectedTile.combination}
                    transform={`translate(${ci * 30 + 5}, ${ri * 30 + 5})`}
                    opacity=".5"
                  />
                )
            );
          })}
          {players.map(({ coord, name, status, color }) =>
            coord && status === "alive" ? (
              <circle
                className={styles[`player_${color}`]}
                key={name}
                cx={coord.col * 30 + 5 + notchCoordinates[coord.notch].x}
                cy={coord.row * 30 + 5 + notchCoordinates[coord.notch].y}
                r="3"
              />
            ) : null
          )}
        </Fragment>
      ))}
    </svg>
  );
};

export default memo(Board);
