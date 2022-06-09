import { DataConnection } from "peerjs";
import { ColoredPair, TileID, tiles } from "../constants/tiles";
import { formatListHumanReadable } from "../utils/strings";
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
  dealTiles,
  getNextNotch,
  getNextTileCoordinate,
  getNextTurnOrder,
  giveDragonToNextPlayer,
  shuffle,
  getPlayerCoordinates,
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
    hostName: name,
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
    coloredPaths: [],
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
  const { players, winners } = state;
  const deck = shuffle(Object.keys(tiles) as TileID[]);
  const newPlayers = { ...players };
  let playerOrder: string[] = [];
  const playersWithoutColor: string[] = [];

  Object.values(newPlayers).forEach((player) => {
    if (player.color) {
      playerOrder.push(player.name);
      newPlayers[player.name] = {
        ...player,
        status: "playing",
        hasDragon: false,
        hand: [],
        startingNotch: undefined,
      };
    } else {
      playersWithoutColor.push(player.name);
    }
  });

  if (playerOrder.length < 8 && playersWithoutColor.length) {
    const isPlural = playersWithoutColor.length > 1;
    if (
      !confirm(
        `${formatListHumanReadable(playersWithoutColor)} ${
          isPlural ? "have" : "has"
        } not picked a colour and won't be part of the game.\nDo you want to start the game anyway?`
      )
    ) {
      // cancel game
      return {};
    }
  }

  // Winner goes first
  if (winners.length > 0) {
    const winnerIndex = playerOrder.findIndex((p) => p === winners[0]);
    playerOrder = [
      ...playerOrder.slice(winnerIndex),
      ...playerOrder.slice(0, winnerIndex),
    ];
  }

  const dealtState = dealTiles(deck, newPlayers, playerOrder);

  return {
    ...dealtState,
    board: emptytBoard,
    playerTurnsOrder: playerOrder,
    gamePhase: "round1",
    winners: [],
    coloredPaths: [],
  };
};

export const resetGame: EngineHandler = (state) => {
  // If no player is waiting to pick a colour we can start straight away
  if (Object.values(state.players).every((p) => p.status !== "watching")) {
    return startGame(state);
  }

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
    deck: [],
    players,
    board: emptytBoard,
    gamePhase: "joining",
    playerTurnsOrder: [],
    selectedTile: undefined,
    coloredPaths: [],
  };
};

export const placePlayer: EngineHandler<[string, Coordinate]> = (
  state,
  player,
  coord
) => {
  const { players, playerTurnsOrder, gamePhase, isHost, hostConn } = state;

  if (!isHost && hostConn) {
    hostConn.send({ type: "placePlayer", coord });
  }

  if (gamePhase !== "round1") return {};

  const currentPlayer = players[playerTurnsOrder[0]];
  // Do nothing if it's not this players' turn
  if (player !== currentPlayer.name) return {};

  const newPlayers = {
    ...state.players,
    [currentPlayer.name]: { ...currentPlayer, startingNotch: coord },
  };
  const everyonePlaced = playerTurnsOrder.every(
    (name) => !!newPlayers[name].startingNotch
  );
  return {
    gamePhase: everyonePlaced ? "main" : gamePhase,
    players: newPlayers,
    playerTurnsOrder: getNextTurnOrder(playerTurnsOrder),
  };
};

export const movePlayers: EngineHandler = (state) => {
  const { board, players, playerTurnsOrder, deck, gamePhase, coloredPaths } =
    state;
  let newPlayers = { ...players };
  let newBoard = [...board];
  let newOrder = [...playerTurnsOrder];
  let newDeck = [...deck];
  let newColoredPaths = [...coloredPaths];

  playerTurnsOrder.forEach((name) => {
    const player = { ...newPlayers[name] };
    let coords = getPlayerCoordinates(player, newColoredPaths);
    if (player.status === "playing" && coords) {
      let keepOn = true;

      while (keepOn && coords) {
        let { notch, row, col } = getNextTileCoordinate(coords);
        const playerCollision = playerTurnsOrder.find((playerName) => {
          const c = getPlayerCoordinates(
            newPlayers[playerName],
            newColoredPaths
          );
          return c && c.col === col && c.row === row && c.notch === notch;
        });
        if (playerCollision || col < 0 || col >= 6 || row < 0 || row >= 6) {
          // Kill current player
          player.status = "dead";
          newDeck = [...newDeck, ...player.hand];
          player.hand = [];
          newPlayers = { ...newPlayers, [player.name]: player };
          newPlayers = giveDragonToNextPlayer(
            player.name,
            newPlayers,
            newOrder
          );
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
              newPlayers,
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

        const pair = nextTile.combination.find((p) => p.includes(newNotch));
        if (player.color && pair) {
          newColoredPaths.push({
            pair:
              pair[0] === newNotch
                ? (`${pair[1]}${pair[0]}` as ColoredPair)
                : pair,
            row,
            col,
            color: player.color,
          });
        }
        coords = getPlayerCoordinates(player, newColoredPaths);
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
    const { players, deck } = dealTiles(newDeck, newPlayers, newOrder);
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
    coloredPaths: newColoredPaths,
    gamePhase: isGameOver ? "finished" : gamePhase,
    winners,
  };
};

export const playTile: EngineHandler<[string, BoardTile]> = (
  state,
  player,
  tile
) => {
  const { id: tileId, combination } = tile;
  const {
    players,
    board,
    playerTurnsOrder,
    deck,
    myPlayer,
    isHost,
    hostConn,
    coloredPaths,
  } = state;

  if (!isHost && hostConn) {
    hostConn.send({ type: "playTile", tile });
  }

  // do nothing if it's not this player's turn
  if (player !== playerTurnsOrder[0]) return {};

  // place tile
  const coord = getPlayerCoordinates(players[player], coloredPaths);
  const newBoard = [...board];
  if (coord) {
    const { row, col } = getNextTileCoordinate(coord);
    newBoard[row] = [...board[row]];
    newBoard[row][col] = { id: tileId, combination };
  }

  // new hand
  const newHand = players[player].hand?.filter((id) => id !== tileId) ?? [];
  const { deck: newDeck, players: newPlayers } = dealTiles(
    deck,
    {
      ...players,
      [player]: {
        ...players[player],
        hand: newHand,
      },
    },
    playerTurnsOrder
  );

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

  const newTurnOrder = movedState.playerTurnsOrder.includes(player)
    ? getNextTurnOrder(movedState.playerTurnsOrder)
    : movedState.playerTurnsOrder;

  return {
    ...movedState,
    playerTurnsOrder: newTurnOrder,
    selectedTile: myPlayer === player ? undefined : state.selectedTile,
  };
};

export const pickColor: EngineHandler<[string, PlayerColor]> = (
  state,
  name,
  color
) => {
  const { players, availableColors, isHost, hostConn } = state;

  if (!isHost && hostConn) {
    hostConn.send({ type: "pickColor", color });
  }

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
    coloredPaths: [],
  };
};

export const removePlayer: EngineHandler<[string]> = (state, playerName) => {
  const { players, deck, playerTurnsOrder, clientConns, availableColors } =
    state;

  const newPlayers = {
    ...giveDragonToNextPlayer(playerName, players, playerTurnsOrder),
  };
  delete newPlayers[playerName];

  const newOrder = playerTurnsOrder.filter((p) => p !== playerName);

  const player = players[playerName];
  const newDeck = [...deck, ...player.hand];

  const dealtState = dealTiles(newDeck, newPlayers, newOrder);

  const newClientConns = { ...clientConns };
  delete newClientConns[playerName];
  clientConns[playerName]?.close();

  return {
    ...dealtState,
    playerTurnsOrder: newOrder,
    clientConns: newClientConns,
    availableColors: [
      ...availableColors,
      ...(player.color ? [player.color] : []),
    ],
  };
};
