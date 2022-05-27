import { TileID, tiles } from "../constants/tiles";
import { EngineHandler, EngineState, BoardTile } from "./types";
import { getNextTileCoordinate, shuffle } from "./utils";

export const createGame = (name: string): Partial<EngineState> => {
  // const host = get().peer;
  const deck = shuffle(Object.keys(tiles) as TileID[]);
  const hand = [deck.shift()!, deck.shift()!, deck.shift()!];
  return {
    deck,
    host: name,
    myPlayer: name,
    players: {
      [name]: {
        name,
        status: "live",
        coord: { row: -1, col: 3, notch: "0" },
        hand,
      },
    },
    playerTurnsOrder: [name],
    playerTurn: name,
    gamePhase: "joining",
  };
};

export const movePlayers: EngineHandler = (state) => {
  return {
    ...state,
  };
};

export const playTile: EngineHandler<[string, BoardTile]> = (
  { players, board, playerTurnsOrder, deck, ...state },
  player,
  tile
) => {
  const coord = players[player]?.coord;
  const newBoard = [...board];
  if (coord) {
    const { row, col } = getNextTileCoordinate(coord);
    newBoard[row] = [...board[row]];
    newBoard[row][col] = tile;
  }
  // new hand
  const newDeck = [...deck];
  const newTile = newDeck.shift() as TileID;
  const newHand = [
    ...(players[player].hand?.filter((id) => id !== tile.id) ?? []),
    newTile,
  ];

  const turnIndex = playerTurnsOrder.findIndex((p) => player === p);
  return movePlayers({
    ...state,
    playerTurnsOrder,
    deck: newDeck,
    board: newBoard,
    playerTurn: playerTurnsOrder[(turnIndex + 1) % playerTurnsOrder.length],
    players: {
      ...players,
      [player]: { ...players[player], hand: newHand },
    },
  });
};
