import { TileID, tiles } from "../constants/tiles";
import { emptytBoard } from "./constants";
import {
  EngineHandler,
  EngineState,
  BoardTile,
  Players,
  Coordinate,
} from "./types";
import {
  getNextNotch,
  getNextTileCoordinate,
  getNextTurnOrder,
  shuffle,
} from "./utils";

export const createGame = (name: string): Partial<EngineState> => {
  // const host = get().peer;
  const deck = shuffle(Object.keys(tiles) as TileID[]);
  const hand = [deck.shift()!, deck.shift()!, deck.shift()!];
  return {
    deck,
    board: emptytBoard,
    host: name,
    myPlayer: name,
    players: {
      [name]: {
        name,
        status: "alive",
        hand,
        color: "red",
      },
    },
    playerTurnsOrder: [name],
    gamePhase: "joining",
  };
};

export const placePlayer: EngineHandler<[Coordinate]> = (state, coord) => {
  const { players, playerTurnsOrder, gamePhase } = state;
  if (gamePhase !== "round1") return {};
  const currentPlayer = players[playerTurnsOrder[0]];
  const newPlayers = {
    ...state.players,
    [currentPlayer.name]: { ...currentPlayer, coord },
  };
  const everyonePlaced = playerTurnsOrder.every(
    (name) => !!newPlayers[name].coord
  );
  return {
    gamePhase: everyonePlaced ? "main" : gamePhase,
    players: newPlayers,
    playerTurnsOrder: getNextTurnOrder(playerTurnsOrder),
  };
};

export const movePlayers: EngineHandler = (state) => {
  const { board, players, playerTurnsOrder, deck, gamePhase } = state;
  let newPlayers = { ...players };
  let newBoard = [...board];
  let newOrder = [...playerTurnsOrder];
  let newDeck = [...deck];
  playerTurnsOrder.forEach((name) => {
    const player = { ...newPlayers[name] };
    if (player.status === "alive" && player.coord) {
      let keepOn = true;

      while (keepOn) {
        let { notch, row, col } = getNextTileCoordinate(player.coord);
        const playerCollision = playerTurnsOrder.find((playerName) => {
          const c = newPlayers[playerName].coord;
          return c && c.col === col && c.row === row && c.notch === notch;
        });
        if (playerCollision || col < 0 || col >= 6 || row < 0 || row >= 6) {
          player.coord = { row, col, notch };
          player.status = "dead";
          if (player.hand) {
            newDeck = [
              ...newDeck.filter((t) => t !== "dragon"),
              ...player.hand.filter((t) => t !== "dragon"),
              "dragon",
            ];
            player.hand = undefined;
          }
          newPlayers = { ...newPlayers, [player.name]: player };
          newOrder = newOrder.filter((p) => p !== player.name);
          if (playerCollision) {
            const collider = { ...newPlayers[playerCollision] };
            collider.status = "dead";
            if (collider.hand) {
              newDeck = [
                ...newDeck.filter((t) => t !== "dragon"),
                ...collider.hand.filter((t) => t !== "dragon"),
                "dragon",
              ];
              player.hand = undefined;
            }
            newPlayers = { ...newPlayers, [collider.name]: collider };
            newOrder = newOrder.filter((p) => p !== collider.name);
          }
          keepOn = false;
          break;
        }
        let nextTile = board[row]?.[col];
        if (!nextTile) {
          newPlayers = { ...newPlayers, [player.name]: player };
          keepOn = false;
          break;
        }
        let newNotch = getNextNotch(notch, nextTile.combination);
        player.coord = { notch: newNotch, row: row, col };

        const pair = nextTile.combination.find((p) => p.includes(newNotch));
        if (player.color && pair) {
          const newTile: BoardTile = {
            ...nextTile,
            coloredPairs: [
              ...(nextTile.coloredPairs ?? []),
              { pair, color: player.color },
            ],
          };

          newBoard[row][col] = newTile;
          console.log("newBoard: ", newBoard);
        }
      }
    }
  });
  const isGameOver =
    newOrder.length < Math.min(Object.keys(players).length, 2) ||
    (newDeck.filter((t) => t && t !== "dragon").length <= 0 &&
      Object.values(newPlayers).every(
        (p) => !p.hand || p.hand.filter((t) => t && t !== "dragon").length <= 0
      ));
  return {
    players: newPlayers,
    board: newBoard,
    playerTurnsOrder: newOrder,
    deck: newDeck,
    gamePhase: isGameOver ? "finished" : gamePhase,
  };
};

export const playTile: EngineHandler<[string, BoardTile]> = (
  state,
  player,
  tile
) => {
  const { players, board, playerTurnsOrder, deck } = state;

  // do nothing if it's not this player's turn
  if (player !== playerTurnsOrder[0]) return {};

  // place tile
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
  const newPlayers = {
    ...players,
    [player]: { ...players[player], hand: newHand },
  };

  // move players
  const movedState = {
    ...state,
    ...movePlayers({
      ...state,
      board: newBoard,
      deck: newDeck,
      players: newPlayers,
    }),
  };

  return {
    ...movedState,
    playerTurnsOrder: getNextTurnOrder(playerTurnsOrder),
    selectedTile: undefined,
  };
};

export const resetGame: EngineHandler = (state) => {
  const deck = [...shuffle(Object.keys(tiles) as TileID[]), "dragon" as const];
  const players = Object.keys(state.players).reduce((acc, name) => {
    return {
      ...acc,
      [name]: {
        ...state.players[name],
        status: "alive" as const,
        hand: [deck.shift()!, deck.shift()!, deck.shift()!],
        coord: undefined,
      },
    };
  }, {} as Players);
  return {
    deck,
    players,
    board: emptytBoard,
    gamePhase: "round1",
    playerTurn: Object.keys(state.players)[0],
    playerTurnsOrder: Object.keys(state.players),
    selectedTile: undefined,
  };
};
