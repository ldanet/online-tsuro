import { Combination, Pair, TileID } from "../constants/tiles";

export type PlayerColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "purple"
  | "black"
  | "white";

export type PlayerStatus = "alive" | "dead";

export type Notch = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";

export type Coordinate = { row: number; col: number; notch: Notch };

export type Player = {
  name: string;
  color?: PlayerColor;
  status: PlayerStatus;
  coord?: Coordinate;
  hand?: (TileID | "dragon")[];
};

export type Players = { [name: string]: Player };

export type ColoredPair = { pair: Pair; color: PlayerColor };

export type BoardTile = {
  id: TileID;
  combination: Combination;
  coloredPairs?: ColoredPair[];
};

export type Board = (BoardTile | null)[][];

export type GamePhase = "joining" | "round1" | "main" | "finished";

export type EngineState = {
  deck: (TileID | "dragon")[];
  players: Players;
  gamePhase: GamePhase;
  board: Board;
  host: string;
  myPlayer: string;
  playerTurnsOrder: string[];
  createGame: (name: string) => void;
  placePlayer: (coord: Coordinate) => void;
  selectedTile?: BoardTile;
  selectTile?: (tile: { id: TileID; combination: Combination }) => void;
  playTile: (
    player: string,
    tile: { id: TileID; combination: Combination }
  ) => void;
  resetGame: () => void;
  // peer: Peer;
};

export type EngineHandler<Args extends unknown[] = []> = (
  state: EngineState,
  ...args: Args
) => Partial<EngineState>;
