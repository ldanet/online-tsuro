import { Board, GamePhase, Notch, PlayerColor, PlayerStatus } from "./types";

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

export const notches: Notch[] = ["0", "1", "2", "3", "4", "5", "6", "7"];
