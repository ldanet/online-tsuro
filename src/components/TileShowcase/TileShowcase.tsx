import { ComponentProps, Fragment, useEffect, useMemo, useState } from "react";
import { TileID, tiles } from "../../constants/tiles";
import { colors } from "../../engine/constants";
import { movePlayers } from "../../engine/handlers";
import {
  Coordinate,
  Player,
  PlayerColor,
  Players as PlayersType,
  SharedGameState,
} from "../../engine/types";
import { shuffle } from "../../engine/utils";
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

const generateBoard = () => {
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
};
const isUnacceptableState = (
  state: SharedGameState,
  currentColor: PlayerColor
) => {
  return (
    state.coloredPaths.filter(
      (coloredPath) => coloredPath.color === currentColor
    ).length < 2
  );
};

const getBoardState = (): SharedGameState => {
  const board = generateBoard();
  const playerColors = shuffle(colors);
  const startingNotches = shuffle(edgeNotchCoordinates);

  let state: SharedGameState = {
    players: {},
    board,
    playerTurnsOrder: [],
    deck: [],
    gamePhase: "main",
    availableColors: [],
    coloredPaths: [],
    winners: [],
  };

  const players: PlayersType = playerColors.reduce(
    (currentPlayers, color, i) => {
      let notch = startingNotches.shift();
      let currentPlayer: Player = {
        color,
        name: color,
        status: "playing",
        hand: [],
        startingNotch: notch,
      };

      const initialPlayerState = {
        ...state,
        playerTurnsOrder: [...playerColors.slice(0, i), color],
        players: { ...currentPlayers, [color]: currentPlayer },
      };

      let nextState: SharedGameState = {
        ...initialPlayerState,
        ...movePlayers(initialPlayerState),
      };

      while (notch && isUnacceptableState(nextState, color)) {
        notch = startingNotches.shift();
        currentPlayer = { ...currentPlayer, startingNotch: notch };
        const newPlayerState = {
          ...initialPlayerState,
          players: { ...currentPlayers, [color]: currentPlayer },
        };
        nextState = { ...newPlayerState, ...movePlayers(newPlayerState) };
      }
      if (!notch) return currentPlayers;
      return {
        ...currentPlayers,
        [color]: { ...currentPlayer, startingNotch: notch },
      };
    },
    {} as PlayersType
  );

  return {
    ...state,
    players,
    playerTurnsOrder: playerColors,
  };
};

type TileShowcaseProps = Omit<
  ComponentProps<typeof Players>,
  "players" | "coloredPaths"
>;

const TileShowcase = ({ ...playersProps }: TileShowcaseProps) => {
  const angle = useMemo(() => Math.random(), []);

  const initialState = useMemo(() => getBoardState(), []);

  const [gameState, setGameState] = useState<SharedGameState>(initialState);

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
      {gameState.board.map((row, ri) => (
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
        {...playersProps}
        players={gameState.players}
        coloredPaths={gameState.coloredPaths}
      />
    </svg>
  );
};

export default TileShowcase;
