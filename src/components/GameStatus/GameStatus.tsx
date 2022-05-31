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
  const winners = useEngine(getWinners);
  const turnOrder = useEngine(getTurnOrder);
  const isHost = useEngine(getIsHost);
  return (
    <>
      {hostId && <span>Game ID: {hostId}</span>}
      <div className={styles.players}>
        {players.map(({ name, status, color, disconnected }) => (
          <div
            className={cn(
              styles.player_pill,
              color && styles[`player_pill__${color}`],
              turnOrder[0] === name && styles.player_pill__turn,
              disconnected && styles.player_pill__disconnected
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
            {name} {status === "dead" && <>☠️</>}
            {winners.includes(name) && <>🏆</>}
          </div>
        ))}
      </div>
    </>
  );
};

export default memo(GameStatus);
