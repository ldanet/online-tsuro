import { memo, ReactNode } from "react";
import { useEngine } from "../../engine/store";
import {
  getAvailableColors,
  getHaspickedColors,
  getIsHost,
  getIsLoading,
  getIsMyTurn,
  getMyPlayer,
  getPhase,
  getResetGame,
  getStartGame,
  getWinners,
} from "../../engine/selectors";
import Hand from "../Hand/Hand";
import { formatListHumanReadable } from "../../utils/strings";

const PlayerActions = () => {
  const isLoading = useEngine(getIsLoading);
  const gamePhase = useEngine(getPhase);
  const hasPickedColor = useEngine(getHaspickedColors);
  const isHost = useEngine(getIsHost);
  const startGame = useEngine(getStartGame);
  const resetGame = useEngine(getResetGame);
  const availableColos = useEngine(getAvailableColors);
  const isMyTurn = useEngine(getIsMyTurn);
  const winners = useEngine(getWinners);
  const myPlayer = useEngine(getMyPlayer);

  if (isLoading) return <p>Connecting...</p>;

  if (gamePhase === "main") return <Hand />;

  if (gamePhase === "joining") {
    if (hasPickedColor) {
      return isHost ? (
        <button type="button" onClick={startGame}>
          Start game
        </button>
      ) : (
        <p>Waiting for the game to start</p>
      );
    } else {
      return availableColos.length ? (
        <p>Please choose a color</p>
      ) : (
        <p>Sorry, the game is full. You can still watch!</p>
      );
    }
  }
  if (gamePhase === "round1" && hasPickedColor) {
    return isMyTurn ? (
      <p>It&apos;s your turn! Pick a notch on the edge of the board</p>
    ) : (
      <p>Wait for your turn</p>
    );
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
          <button type="button" onClick={resetGame}>
            New game
          </button>
        )}
      </>
    );
  }
  return null;
};

export default memo(PlayerActions);
