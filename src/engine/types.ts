import { ColoredPair, Combination, Notch, TileID } from "../constants/tiles";

export type PlayerColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "purple"
  | "cyan"
  | "pink"
  | "black"
  | "white";

export type PlayerStatus = "playing" | "dead" | "watching";

export type Coordinate = { row: number; col: number; notch: Notch };

export type Player = {
  name: string;
  color?: PlayerColor;
  status: PlayerStatus;
  startingNotch?: Coordinate;
  hand: TileID[];
  hasDragon?: boolean;
  disconnected?: boolean;
};

export type Players = { [name: string]: Player };

export type ColoredPath = {
  row: number;
  col: number;
  pair: ColoredPair;
  color: PlayerColor;
};

export type BoardTile = {
  id: TileID;
  combination: Combination;
};

export type Board = (BoardTile | null)[][];

export type GamePhase = "joining" | "round1" | "main" | "finished";

export type SharedGameState = {
  deck: TileID[];
  players: Players;
  gamePhase: GamePhase;
  board: Board;
  playerTurnsOrder: string[];
  availableColors: PlayerColor[];
  coloredPaths: ColoredPath[];
  winners: string[];
};

export type LocalState = {
  // Game
  myPlayer: string;
  selectedTile?: BoardTile;

  // Network
  isLoading: boolean;
  hostId?: string;
  hostName?: string;
  isHost: boolean;
  hostConn: TDataConnection | null;
  clientConns: { [name: string]: TDataConnection };
};

export type Actions = {
  // Client only
  joinGame: (name: string, hostId: string) => void;

  // Host only
  createGame: (name: string) => void;
  resetGame: () => void;
  startGame: () => void;
  addPlayer: (name: string, conn: TDataConnection) => void;
  removePlayer: (name: string) => void;

  // Network
  setIsLoading: (isLoading: boolean) => void;
  setHostId: (hostId: string | undefined) => void;
  setIsHost: (isHost: boolean) => void;

  // Game
  setSelectedTile: (tile: BoardTile) => void;
  placePlayer: (player: string, coord: Coordinate) => void;
  playTile: (player: string, tile: BoardTile) => void;
  playSelectedTile: () => void;
  pickColor: (player: string, color: PlayerColor) => void;
};

export type EngineState = SharedGameState & LocalState & Actions;

export type EngineHandler<Args extends unknown[] = []> = (
  state: EngineState,
  ...args: Args
) => Partial<EngineState>;

export type GameUpdateMessage = {
  type: "gameUpdate";
  state: SharedGameState;
};
