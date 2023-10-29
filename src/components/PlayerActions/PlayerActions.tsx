import { memo, ReactNode } from "react";
import { useEngine } from "../../engine/store";
import {
  getAvailableColors,
  getHaspickedColors,
  getHostName,
  getIsHost,
  getIsLoading,
  getMyPlayer,
  getPhase,
  getResetGame,
  getStartGame,
  getWinners,
} from "../../engine/selectors";
import Hand from "../Hand/Hand";
import { formatListHumanReadable } from "../../utils/strings";
import Button from "../Button";

const PlayerActions = () => {
  const isLoading = useEngine(getIsLoading);
  const gamePhase = useEngine(getPhase);
  const hasPickedColor = useEngine(getHaspickedColors);
  const isHost = useEngine(getIsHost);
  const startGame = useEngine(getStartGame);
  const resetGame = useEngine(getResetGame);
  const availableColors = useEngine(getAvailableColors);
  const myPlayer = useEngine(getMyPlayer);
  const hostName = useEngine(getHostName);

  if (isLoading) return <p>Connecting...</p>;

  if (gamePhase === "main" || gamePhase === "round1") return <Hand />;

  if (gamePhase === "joining") {
    if (hasPickedColor) {
      return (
        <div className="text-center">
          {isHost ? (
            <Button type="button" onClick={startGame}>
              Start game
            </Button>
          ) : (
            <p>Waiting for {hostName} to start the game</p>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-center">
          {availableColors.length ? (
            <p>Please choose a color</p>
          ) : (
            <p>Sorry, the game is full. You can still watch!</p>
          )}
        </div>
      );
    }
  }
  if (gamePhase === "finished" && isHost) {
    return (
      <div className="text-center">
        <Button type="button" onClick={resetGame}>
          New game
        </Button>
      </div>
    );
  }
  return null;
};

export default memo(PlayerActions);
