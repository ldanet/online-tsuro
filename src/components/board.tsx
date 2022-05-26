import { memo } from "react";
import { Combination, tiles } from "../constants/tiles";
import { Corner, Edge } from "./edge";
import Tile from "./tile";
import styles from "../styles/Board.module.css";

const Board = () => {
  const board: Combination[][] = new Array(6)
    .fill(new Array(6).fill(0))
    .map((arr) =>
      arr.map(() => {
        const tile = tiles[Math.floor(Math.random() * tiles.length)];
        return tile[Math.floor(Math.random() * tile.length)];
      })
    );
  return (
    <div className={styles.board}>
      <Corner />
      {new Array(6).fill(true).map((_, i) => (
        <Edge key={i} type="top" />
      ))}
      <Corner />
      {board.map((row, ri) => (
        <>
          <Edge type="left" />
          {row.map((col, ci) => (
            <Tile key={`${ri}-${ci}`} combination={col} />
          ))}
          <Edge type="right" />
        </>
      ))}
      <Corner />
      {new Array(6).fill(true).map((_, i) => (
        <Edge key={i} type="bottom" />
      ))}
      <Corner />
    </div>
  );
};

export default memo(Board);
