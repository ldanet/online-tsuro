import { Combination, TileID, TileType } from "../constants/tiles";

export type PlayerColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "purple";

export type PlayerStatus = "live" | "dead";

export type Notch = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";

export type Coordinate = { row: number; col: number; notch: Notch };

export type Player = {
  name: string;
  color?: PlayerColor;
  status: PlayerStatus;
  coord?: Coordinate;
  hand?: TileID[];
};

export type BoardTile = { id: TileID; combination: Combination };

export type Board = (BoardTile | null)[][];

export type GamePhase = "joining" | "round1" | "main" | "finished";

export type EngineState = {
  deck: TileID[];
  players: { [name: string]: Player };
  gamePhase: GamePhase;
  board: Board;
  host: string;
  myPlayer: string;
  createGame: (name: string) => void;
  playerTurn?: string;
  selectedTile?: BoardTile;
  selectTile?: (tile: { id: TileID; combination: Combination }) => void;
  playTile: (
    player: string,
    tile: { id: TileID; combination: Combination }
  ) => void;
  // peer: Peer;
  playerTurnsOrder: string[];
};

export type EngineHandler<Args extends unknown[] = []> = (
  state: EngineState,
  ...args: Args
) => Partial<EngineState>;
