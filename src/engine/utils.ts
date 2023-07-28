import {
  BoardTile,
  ColoredPath,
  Coordinate,
  GamePhase,
  GameUpdateMessage,
  Player,
  PlayerColor,
  Players,
  PlayerStatus,
} from "./types";
import {
  ColoredPair,
  coloredPairs,
  Combination,
  pairs,
  TileID,
  tileIds,
  Notch,
  notches,
} from "../constants/tiles";
import { hasProperty } from "../utils/types";
import { colors, gamePhases, playerStatuses } from "./constants";

export const getNextTileCoordinate = ({
  row,
  col,
  notch,
}: Coordinate): Coordinate => {
  switch (notch) {
    case "0":
      return { row: row + 1, col, notch: "5" };
    case "1":
      return { row: row + 1, col, notch: "4" };
    case "2":
      return { row, col: col + 1, notch: "7" };
    case "3":
      return { row, col: col + 1, notch: "6" };
    case "4":
      return { row: row - 1, col, notch: "1" };
    case "5":
      return { row: row - 1, col, notch: "0" };
    case "6":
      return { row, col: col - 1, notch: "3" };
    case "7":
      return { row, col: col - 1, notch: "2" };
  }
};

export const getNextNotch = (notch: Notch, combination: Combination): Notch => {
  const pair = combination.find((p) => p.includes(notch));
  return pair?.replace(notch, "") as Notch;
};

export const shuffle = <T extends any>(a: readonly T[]): T[] => {
  const array = [...a];
  let curr = array.length;

  // While there remain elements to shuffle…
  while (curr > 0) {
    // Pick a remaining element…
    const i = Math.floor(Math.random() * curr--);

    // And swap it with the current element.
    [array[i], array[curr]] = [array[curr], array[i]];
  }

  return array;
};

export const dealTiles = (
  deck: TileID[],
  players: Players,
  turnOrder: string[]
) => {
  let newPlayers = { ...players };
  let newDeck = [...deck];

  let playerIndex = turnOrder.findIndex((name) => newPlayers[name].hasDragon);
  if (playerIndex === -1) playerIndex = 0;

  // as long as player still have room in their hand and there are tiles to be dealt
  while (
    turnOrder.some(
      (name) =>
        newPlayers[name]?.status === "playing" &&
        newPlayers[name]?.hand.length < 3
    )
  ) {
    const player = newPlayers[turnOrder[playerIndex]];

    if (player.hand.length! < 3 && player.status === "playing") {
      // Assign dragon
      if (newDeck.length == 0) {
        newPlayers = {
          ...newPlayers,
          [player.name]: { ...player, hasDragon: true },
        };
        break;
      }
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

    playerIndex = (playerIndex + 1) % turnOrder.length;
  }
  return { deck: newDeck, players: newPlayers };
};

export const giveDragonToNextPlayer = (
  playerName: string,
  players: Players,
  turnOrder: string[]
) => {
  const player = players[playerName];

  if (player.hasDragon) {
    const playerTurn = turnOrder.findIndex((p) => p === playerName) + 1;
    const order = [
      ...turnOrder.slice(playerTurn),
      ...turnOrder.slice(0, playerTurn),
    ];

    const nextPlayer = order.find(
      (p) => players[p].hand.length < 3 && players[p].status === "playing"
    );
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

export const getNextTurnOrder = (order: string[]) => {
  const [curr, ...rest] = order;
  return [...rest, curr];
};

export const getPlayerCoordinates = (player: Player, paths: ColoredPath[]) => {
  if (!player.color) return undefined;
  const playerPaths = paths.filter((path) => path.color === player.color);
  let playerCoord: Coordinate | undefined;
  if (playerPaths.length > 0) {
    const lastPath = playerPaths[playerPaths.length - 1];
    playerCoord = {
      row: lastPath.row,
      col: lastPath.col,
      notch: lastPath.pair[1] as Notch,
    };
  } else {
    playerCoord = player.startingNotch;
  }
  return playerCoord;
};

export function isBoardTile(tile: unknown): tile is BoardTile {
  return (
    hasProperty(tile, "id") &&
    tileIds.includes(tile.id as TileID) &&
    hasProperty(tile, "combination") &&
    Array.isArray(tile.combination) &&
    tile.combination.every((pair) => pairs.includes(pair))
  );
}

export function isCoordinate(coord: unknown): coord is Coordinate {
  return (
    hasProperty(coord, "row") &&
    typeof coord.row === "number" &&
    hasProperty(coord, "col") &&
    typeof coord.col === "number" &&
    hasProperty(coord, "notch") &&
    notches.includes(coord.notch as Notch)
  );
}

export function isColoredPath(path: unknown): path is ColoredPath {
  return (
    hasProperty(path, "row") &&
    typeof path.row === "number" &&
    hasProperty(path, "col") &&
    typeof path.col === "number" &&
    hasProperty(path, "pair") &&
    coloredPairs.includes(path.pair as ColoredPair) &&
    hasProperty(path, "color") &&
    colors.includes(path.color as PlayerColor)
  );
}

export function isPlayer(player: unknown): player is Player {
  if (
    hasProperty(player, "color") &&
    !colors.includes(player.color as PlayerColor)
  ) {
    return false;
  }
  if (
    hasProperty(player, "coord") &&
    !(player.coord === null || isCoordinate(player.coord))
  ) {
    return false;
  }
  if (
    hasProperty(player, "hasDragon") &&
    typeof player.hasDragon !== "boolean"
  ) {
    return false;
  }

  return (
    // Name
    hasProperty(player, "name") &&
    typeof player.name === "string" &&
    // Status
    hasProperty(player, "status") &&
    playerStatuses.includes(player.status as PlayerStatus) &&
    // Hand
    hasProperty(player, "hand") &&
    Array.isArray(player.hand) &&
    player.hand.every((id) => tileIds.includes(id))
  );
}

export function isGameUpdateMessage(
  message: unknown
): message is GameUpdateMessage {
  if (typeof message !== "object" || message === null) return false;

  if (!hasProperty(message, "type") || message.type !== "gameUpdate")
    return false;

  if (!hasProperty(message, "state")) return false;
  const state = message.state;

  return (
    // Game phase
    hasProperty(state, "gamePhase") &&
    gamePhases.includes(state.gamePhase as GamePhase) &&
    //
    // Turn order
    hasProperty(state, "playerTurnsOrder") &&
    Array.isArray(state.playerTurnsOrder) &&
    state.playerTurnsOrder.every((val) => val && typeof val === "string") &&
    //
    // Winners
    hasProperty(state, "winners") &&
    Array.isArray(state.winners) &&
    state.winners.every((val) => val && typeof val === "string") &&
    //
    // Deck
    hasProperty(state, "deck") &&
    Array.isArray(state.deck) &&
    state.deck.every((val) => tileIds.includes(val)) &&
    //
    // Colors
    hasProperty(state, "availableColors") &&
    Array.isArray(state.availableColors) &&
    state.availableColors.every((val) => colors.includes(val)) &&
    //
    // Colored Paths
    hasProperty(state, "coloredPaths") &&
    Array.isArray(state.coloredPaths) &&
    state.coloredPaths.every((val) => isColoredPath(val)) &&
    //
    // Board
    hasProperty(state, "board") &&
    Array.isArray(state.board) &&
    state.board.length === 6 &&
    state.board.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 6 &&
        row.every((tile) => tile === null || isBoardTile(tile))
    ) &&
    //
    // Players
    hasProperty(state, "players") &&
    state.players !== null &&
    typeof state.players === "object" &&
    Object.values(state.players).every(isPlayer)
  );
}
