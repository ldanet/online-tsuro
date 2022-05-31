import { memo } from "react";
import {
  getStartGame,
  getHostId,
  getIsHost,
  getPhase,
  getPlayers,
  getResetGame,
  getTurnOrder,
  getWinners,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { cn } from "../../utils/styles";
import styles from "./GameStatus.module.css";

const GameStatus = () => {
  const players = useEngine(getPlayers);
  const hostId = useEngine(getHostId);
  const phase = useEngine(getPhase);

  const resetGame = useEngine(getResetGame);
  const startGame = useEngine(getStartGame);
  const isHost = useEngine(getIsHost);
  const winners = useEngine(getWinners);
  const turnOrder = useEngine(getTurnOrder);
  return (
    <>
      {hostId && <span>Game ID: {hostId}</span>}
      <div className={styles.players}>
        {players.map(({ name, status, color }) => (
          <div
            className={cn(
              styles.player_pill,
              color && styles[`player_pill__${color}`],
              turnOrder[0] === name && styles.player_pill__turn
            )}
            key={name}
          >
            {color && (
              <div
                className={cn(
                  styles.player_token,
                  styles[`player_token__${color}`]
                )}
              />
            )}
            {status === "dead" && <>❌</>} {name}{" "}
            {winners.includes(name) && <>🏆</>}
          </div>
        ))}
      </div>
      {isHost && (
        <>
          {phase === "joining" && (
            <button onClick={startGame}>Start game</button>
          )}
          {phase === "finished" && (
            <button onClick={resetGame}>New game</button>
          )}
        </>
      )}
    </>
  );
};

export default memo(GameStatus);
