import { Fragment, memo, useCallback } from "react";
import { Edge } from "../Edge/Edge";
import { useEngine } from "../../engine/store";
import { getNextTileCoordinate } from "../../engine/utils";
import Tile from "../Tile/Tile";
import styles from "./Board.module.css";

const Board = () => {
  const { board, selectedTile, selectedTileCoord } = useEngine(
    useCallback(
      ({ board, selectedTile, players, myPlayer }) => ({
        board,
        selectedTile,
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
        <Edge key={i} type="top" transform={`translate(${i * 30 + 5}, 0)`} />
      ))}
      {new Array(6).fill(true).map((_, i) => (
        <Edge
          key={i}
          type="bottom"
          transform={`translate(${i * 30 + 5}, 185)`}
        />
      ))}
      {board.map((row, ri) => (
        <Fragment key={ri}>
          <Edge type="left" transform={`translate( 0, ${ri * 30 + 5})`} />
          <Edge type="right" transform={`translate(185, ${ri * 30 + 5})`} />
          {row.map((col, ci) => {
            return col ? (
              <Tile
                key={`${ri}-${ci}`}
                combination={col?.combination}
                transform={`translate(${ci * 30 + 5}, ${ri * 30 + 5})`}
              />
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
        </Fragment>
      ))}
    </svg>
  );
};

export default memo(Board);
