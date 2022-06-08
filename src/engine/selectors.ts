import { EngineState } from "./types";

// Game state
export const getBoard = (state: EngineState) => state.board;
export const getPhase = ({ gamePhase }: EngineState) => gamePhase;
export const getPlayers = ({ players }: EngineState) => players;
export const getPlayersArray = ({ players }: EngineState) => {
  return Object.values(players);
};
export const getWinners = ({ winners }: EngineState) => winners;
export const getTurnOrder = ({ playerTurnsOrder }: EngineState) =>
  playerTurnsOrder;
export const getAvailableColors = ({ availableColors }: EngineState) =>
  availableColors;
export const getColoredPaths = ({ coloredPaths }: EngineState) => coloredPaths;

// My player
export const getMyPlayer = ({ myPlayer }: EngineState) => myPlayer;
export const getMyPlayerData = ({ myPlayer, players }: EngineState) =>
  players[myPlayer];
export const getIsMyTurn = ({ myPlayer, playerTurnsOrder }: EngineState) =>
  myPlayer === playerTurnsOrder[0];
export const getSelectedTile = (state: EngineState) => state.selectedTile;
export const getHaspickedColors = ({ myPlayer, players }: EngineState) =>
  !!players[myPlayer]?.color;

// Game actions
export const getCreateGame = ({ createGame }: EngineState) => createGame;
export const getJoinGame = ({ joinGame }: EngineState) => joinGame;
export const getResetGame = ({ resetGame }: EngineState) => resetGame;
export const getStartGame = ({ startGame }: EngineState) => startGame;
export const getPickColor = ({ pickColor }: EngineState) => pickColor;
export const getSetSelectedTile = ({ setSelectedTile }: EngineState) =>
  setSelectedTile;
export const getPlayTile = ({ playTile }: EngineState) => playTile;
export const getRemovePlayer = ({ removePlayer }: EngineState) => removePlayer;

// Network state
export const getHostId = ({ hostId }: EngineState) => {
  return hostId;
};
export const getIsHost = ({ isHost }: EngineState) => isHost;
export const getIsLoading = ({ isLoading }: EngineState) => isLoading;

// Network actions
export const getSetPeer = ({ setPeer }: EngineState) => setPeer;
export const getSetIsConnected = ({ setIsConnected }: EngineState) =>
  setIsConnected;
export const getSetIsLoading = ({ setIsLoading }: EngineState) => setIsLoading;
export const getSetHostId = ({ setHostId }: EngineState) => setHostId;
