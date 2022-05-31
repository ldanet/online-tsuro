import { DataConnection } from "peerjs";
import { TileID, tiles } from "../constants/tiles";
import { colors, emptytBoard } from "./constants";
import {
  EngineHandler,
  EngineState,
  BoardTile,
  Players,
  Coordinate,
  PlayerColor,
} from "./types";
import {
  getNextNotch,
  getNextTileCoordinate,
  getNextTurnOrder,
  shuffle,
} from "./utils";

export const createGame: EngineHandler<[string]> = (
  _,
  name
): Partial<EngineState> => {
  return {
    deck: [],
    board: emptytBoard,
    isHost: true,
    hostId: undefined,
    myPlayer: name,
    availableColors: colors,
    players: {
      [name]: {
        name,
        status: "watching",
        hand: [],
      },
    },
    playerTurnsOrder: [],
    gamePhase: "joining",
    winners: [],
  };
};

export const addPlayer: EngineHandler<[string, DataConnection]> = (
  state,
  name,
  conn
) => {
  return {
    players: {
      ...state.players,
      [name]: { name, status: "watching", hand: [] },
    },
    clientConns: { ...state.clientConns, [name]: conn },
  };
};

export const startGame: EngineHandler = (state) => {
  const { players } = state;
  const deck = shuffle(Object.keys(tiles) as TileID[]);
  const newPlayers = { ...players };
  const playerOrder: string[] = [];
  const playersWithoutColor: string[] = [];

  Object.values(newPlayers).forEach((player) => {
    if (player.color) {
      playerOrder.push(player.name);
      newPlayers[player.name] = {
        ...player,
        status: "playing",
        hasDragon: false,
        hand: [],
        coord: undefined,
      };
    } else {
      playersWithoutColor.push(player.name);
    }
  });

  if (playerOrder.length < 8 && playersWithoutColor.length) {
    const isPlural = playersWithoutColor.length > 1;
    const lastPlayer = playersWithoutColor.shift();
    if (
      !confirm(
        `${[playersWithoutColor.join(", "), lastPlayer]
          .filter(Boolean)
          .join(" and ")} ${
          isPlural ? "have" : "has"
        } not picked a colour and won't be part of the game.\nDo you want to start the game anyway?`
      )
    ) {
      // cancel game
      return {};
    }
  }

  const dealtState = dealTiles({
    ...state,
    players: newPlayers,
    deck,
    playerTurnsOrder: playerOrder,
  });

  return {
    board: emptytBoard,
    ...dealtState,
    playerTurnsOrder: playerOrder,
    gamePhase: "round1",
    winners: [],
  };
};

export const resetGame: EngineHandler = (state) => {
  // If no player is waiting to pick a colour we can start straight away
  if (Object.values(state.players).every((p) => p.status !== "watching")) {
    return startGame(state);
  }

  const deck = shuffle(Object.keys(tiles) as TileID[]);
  const players = Object.keys(state.players).reduce((acc, name) => {
    return {
      ...acc,
      [name]: {
        ...state.players[name],
        status: "watching" as const,
        hand: [],
        coord: undefined,
        hasDragon: false,
      },
    };
  }, {} as Players);
  return {
    deck,
    players,
    board: emptytBoard,
    gamePhase: "joining",
    playerTurnsOrder: [],
    selectedTile: undefined,
    winners: [],
  };
};

export const placePlayer: EngineHandler<[string, Coordinate]> = (
  state,
  player,
  coord
) => {
  const { players, playerTurnsOrder, gamePhase } = state;
  if (gamePhase !== "round1") return {};

  const currentPlayer = players[playerTurnsOrder[0]];
  // Do nothing if it's not this players' turn
  if (player !== currentPlayer.name) return {};

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

const dealTiles: EngineHandler<[number?]> = (state) => {
  const { deck, players, playerTurnsOrder } = state;
  let newPlayers = { ...players };
  let newDeck = [...deck];

  let playerIndex = playerTurnsOrder.findIndex(
    (name) => newPlayers[name].hasDragon
  );
  if (playerIndex === -1) playerIndex = 0;

  // as long as player still have room in their hand and there are tiles to be dealt
  while (
    newDeck.length &&
    playerTurnsOrder.some((name) => newPlayers[name]?.hand.length < 3)
  ) {
    const player = newPlayers[playerTurnsOrder[playerIndex]];

    if (player.hand.length! < 3 && player.status === "playing") {
      const newTile = newDeck.shift() as TileID;
      newPlayers = {
        ...newPlayers,
        [player.name]: {
          ...player,
          hand: [...player.hand, newTile],
          hasDragon: false,
        },
      };
    }
    playerIndex = (playerIndex + 1) % playerTurnsOrder.length;
  }
  return { deck: newDeck, players: newPlayers };
};

const giveDragonToNextPlayer = (
  playerName: string,
  players: Players,
  turnOrder: string[]
) => {
  const player = players[playerName];
  const playerTurn = turnOrder.findIndex((p) => p === playerName);
  const order = [
    ...turnOrder.slice(playerTurn),
    ...turnOrder.slice(0, playerTurn),
  ];
  if (player.hasDragon) {
    const nextPlayer = order.find((p) => players[p].hand.length < 3);
    if (nextPlayer) {
      return {
        ...players,
        [nextPlayer]: { ...players[nextPlayer], hasDragon: true },
        [playerName]: { ...players[playerName], hasDragon: false },
      };
    }
  }
  return players;
};

export const movePlayers: EngineHandler = (state) => {
  const { board, players, playerTurnsOrder, deck, gamePhase } = state;
  let newPlayers = { ...players };
  let newBoard = [...board];
  let newOrder = [...playerTurnsOrder];
  let newDeck = [...deck];
  playerTurnsOrder.forEach((name) => {
    const player = { ...newPlayers[name] };
    if (player.status === "playing" && player.coord) {
      let keepOn = true;

      while (keepOn) {
        let { notch, row, col } = getNextTileCoordinate(player.coord);
        const playerCollision = playerTurnsOrder.find((playerName) => {
          const c = newPlayers[playerName].coord;
          return c && c.col === col && c.row === row && c.notch === notch;
        });
        if (playerCollision || col < 0 || col >= 6 || row < 0 || row >= 6) {
          // Kill current player
          player.coord = { row, col, notch };
          player.status = "dead";
          newDeck = [...newDeck, ...player.hand];
          player.hand = [];
          newPlayers = { ...newPlayers, [player.name]: player };
          newPlayers = giveDragonToNextPlayer(player.name, players, newOrder);
          newOrder = newOrder.filter((p) => p !== player.name);

          if (playerCollision) {
            // Kill the player they collidede with
            const collider = { ...newPlayers[playerCollision] };
            collider.status = "dead";
            newDeck = [...newDeck, ...collider.hand];
            player.hand = [];
            newPlayers = { ...newPlayers, [collider.name]: collider };
            newPlayers = giveDragonToNextPlayer(
              collider.name,
              players,
              newOrder
            );
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
        }
      }
    }
  });
  const isGameOver =
    newOrder.length < Math.min(Object.keys(players).length, 2) ||
    (newDeck.filter(Boolean).length <= 0 &&
      Object.values(newPlayers).every(
        (p) => !p.hand || p.hand.filter(Boolean).length <= 0
      ));

  // distribute tiles if the deck has been replenished
  if (!isGameOver && newDeck.length) {
    const { players, deck } = dealTiles({
      ...state,
      playerTurnsOrder: newOrder,
      deck: newDeck,
      players: newPlayers,
    });
    newPlayers = players ?? newPlayers;
    newDeck = deck ?? newDeck;
  }
  let winners: string[] = [];
  if (isGameOver) {
    // There are still players alive, they win
    if (newOrder.length) {
      winners = newOrder;
    } else {
      // Last players to die win
      winners = playerTurnsOrder;
    }
    winners.forEach((name) => {
      newPlayers = {
        ...newPlayers,
        [name]: {
          ...newPlayers[name],
        },
      };
    });
  }

  return {
    players: newPlayers,
    board: newBoard,
    playerTurnsOrder: newOrder,
    deck: newDeck,
    gamePhase: isGameOver ? "finished" : gamePhase,
    winners,
  };
};

export const playTile: EngineHandler<[string, BoardTile]> = (
  state,
  player,
  { id: tileId, combination }
) => {
  const { players, board, playerTurnsOrder, deck, myPlayer } = state;

  // do nothing if it's not this player's turn
  if (player !== playerTurnsOrder[0]) return {};

  // place tile
  const coord = players[player]?.coord;
  const newBoard = [...board];
  if (coord) {
    const { row, col } = getNextTileCoordinate(coord);
    newBoard[row] = [...board[row]];
    newBoard[row][col] = { id: tileId, combination };
  }

  // new hand
  const newHand = players[player].hand?.filter((id) => id !== tileId) ?? [];
  const isEmptyDeck = deck.length === 0;
  const isDragonAvailable = Object.values(players).every((p) => !p.hasDragon);
  const newDeck = [...deck];

  if (!isEmptyDeck) {
    const newTile = newDeck.shift() as TileID;
    newHand.push(newTile);
  }
  const newPlayers = {
    ...players,
    [player]: {
      ...players[player],
      hand: newHand,
      hasDragon: isDragonAvailable && isEmptyDeck,
    },
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
    selectedTile: myPlayer === player ? undefined : state.selectedTile,
  };
};

export const pickColor: EngineHandler<[string, PlayerColor]> = (
  state,
  name,
  color
) => {
  const { players, availableColors } = state;
  const player = { ...players[name] };
  player.color = color;
  return {
    players: {
      ...players,
      [name]: player,
    },
    availableColors: availableColors.filter((c) => color !== c),
  };
};

export const joinGame: EngineHandler<[string, string]> = (_, name, hostId) => {
  return {
    deck: [],
    hostId,
    isHost: false,
    board: emptytBoard,
    myPlayer: name,
    players: {
      [name]: {
        name,
        status: "watching",
        hand: [],
      },
    },
    playerTurnsOrder: [],
    gamePhase: "joining",
    availableColors: [],
  };
};
