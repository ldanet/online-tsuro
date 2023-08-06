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
  const availableColos = useEngine(getAvailableColors);
  const winners = useEngine(getWinners);
  const myPlayer = useEngine(getMyPlayer);
  const hostName = useEngine(getHostName);

  if (isLoading) return <p>Connecting...</p>;

  if (gamePhase === "main" || gamePhase === "round1") return <Hand />;

  if (gamePhase === "joining") {
    if (hasPickedColor) {
      return isHost ? (
        <Button type="button" onClick={startGame}>
          Start game
        </Button>
      ) : (
        <p>Waiting for {hostName} to start the game</p>
      );
    } else {
      return availableColos.length ? (
        <p>Please choose a color</p>
      ) : (
        <p>Sorry, the game is full. You can still watch!</p>
      );
    }
  }

  if (gamePhase === "finished") {
    let message: ReactNode;
    if (winners.length > 1) {
      if (winners.includes(myPlayer)) {
        const otherWinners = winners.filter((name) => name !== myPlayer);
        message = (
          <p>🏆 You tie with {formatListHumanReadable(otherWinners)}!</p>
        );
      } else {
        message = <p>{formatListHumanReadable(winners)} tie!</p>;
      }
    } else {
      message =
        winners[0] === myPlayer ? (
          <p>🏆 You win!</p>
        ) : (
          <p>{winners[0]} wins!</p>
        );
    }
    return (
      <>
        {message}
        {isHost && (
          <Button type="button" onClick={resetGame}>
            New game
          </Button>
        )}
      </>
    );
  }
  return null;
};

export default memo(PlayerActions);
