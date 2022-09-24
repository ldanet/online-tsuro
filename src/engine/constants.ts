import { Board, GamePhase, PlayerColor, PlayerStatus } from "./types";

export const emptytBoard: Board = [
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
];

export const colors: PlayerColor[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "cyan",
  "pink",
  "black",
  "white",
];

export const playerStatuses: PlayerStatus[] = ["playing", "dead", "watching"];

export const gamePhases: GamePhase[] = [
  "joining",
  "round1",
  "main",
  "finished",
];
