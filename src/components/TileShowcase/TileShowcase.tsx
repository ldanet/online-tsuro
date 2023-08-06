import { transform } from "framer-motion";
import { Fragment, useEffect, useMemo, useState } from "react";
import { TileID, tiles } from "../../constants/tiles";
import { colors } from "../../engine/constants";
import { movePlayers } from "../../engine/handlers";
import {
  Coordinate,
  Players as PlayersType,
  SharedGameState,
} from "../../engine/types";
import { shuffle } from "../../engine/utils";
import { useIsMounted } from "../../utils/hooks";
import { getTranslate } from "../../utils/math";
import Edge, { typeToNotches } from "../Edge/Edge";
import Players from "../Players/Players";
import Tile from "../Tile/Tile";

const topBottomNotchCoordinates = Array(6)
  .fill(true)
  .reduce<Coordinate[]>(
    (list, _, col) => [
      ...list,
      { row: -1, col, notch: typeToNotches["top"][0] },
      { row: -1, col, notch: typeToNotches["top"][1] },
      { row: 6, col, notch: typeToNotches["bottom"][0] },
      { row: 6, col, notch: typeToNotches["bottom"][1] },
    ],
    []
  );
const leftRightNotchCoordinates = Array(6)
  .fill(true)
  .reduce<Coordinate[]>(
    (list, _, row) => [
      ...list,
      { col: -1, row, notch: typeToNotches["left"][0] },
      { col: -1, row, notch: typeToNotches["left"][1] },
      { col: 6, row, notch: typeToNotches["right"][0] },
      { col: 6, row, notch: typeToNotches["right"][1] },
    ],
    []
  );

const edgeNotchCoordinates = [
  ...topBottomNotchCoordinates,
  ...leftRightNotchCoordinates,
];

const TileShowcase = () => {
  const board = useMemo(() => {
    const shuffledTiles = shuffle([
      ...Object.keys(tiles),
      null,
    ] as (TileID | null)[]);

    return Array(6)
      .fill(true)
      .map((_, i) =>
        Array(6)
          .fill(true)
          .map((_, j) => {
            const tileID = shuffledTiles[i + 6 * j];
            if (tileID === null) return null;
            const tile = tiles[tileID];
            return {
              id: tileID,
              combination:
                tile.combinations[
                  Math.floor((Math.random() * 4) % tile.combinations.length)
                ],
            };
          })
      );
  }, []);

  const angle = useMemo(() => Math.random(), []);

  const playerColors = shuffle(colors);
  const startingNotches = shuffle(edgeNotchCoordinates);

  const [gameState, setGameState] = useState<SharedGameState>({
    players: playerColors.reduce(
      (players, color, i) => ({
        ...players,
        [color]: {
          color,
          name: color,
          status: "playing",
          hand: [],
          startingNotch: startingNotches[i],
        },
      }),
      {} as PlayersType
    ),
    board,
    playerTurnsOrder: playerColors,
    deck: [],
    gamePhase: "main",
    availableColors: [],
    coloredPaths: [],
    winners: [],
  });

  useEffect(() => {
    setGameState((state) => ({ ...state, ...movePlayers(state) }));
  }, []);

  return (
    <svg
      viewBox="0 0 190 190"
      className="m-4 h-[--board-size] w-[--board-size] bg-board"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      style={{ transform: `scale(2.5) rotate(${angle}turn)` }}
    >
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
      <Players
        players={gameState.players}
        coloredPaths={gameState.coloredPaths}
      />
    </svg>
  );
};

export default TileShowcase;
