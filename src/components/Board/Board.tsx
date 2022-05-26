import { Fragment, memo } from "react";
import { Combination, tiles } from "../../constants/tiles";
import { Edge } from "../Edge/Edge";
import Tile from "../Tile/Tile";
import styles from "./Board.module.css";

const Board = () => {
  const deck = Object.values(tiles);
  const board: Combination[][] = new Array(6)
    .fill(new Array(6).fill(0))
    .map((arr) =>
      arr.map(() => {
        const tile = deck[Math.floor(Math.random() * deck.length)];
        return tile[Math.floor(Math.random() * tile.length)];
      })
    );
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
          {row.map((col, ci) => (
            <Tile
              key={`${ri}-${ci}`}
              combination={col}
              transform={`translate(${ci * 30 + 5}, ${ri * 30 + 5})`}
            />
          ))}
        </Fragment>
      ))}
    </svg>
  );
};

export default memo(Board);
