import { memo, useCallback } from "react";
import {
  getIsHost,
  getPhase,
  getPlayersArray,
  getTurnOrder,
  getWinners,
  getRemovePlayer,
  getMyPlayer,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { cn } from "../../utils/styles";
import styles from "./GameStatus.module.css";

const GameStatus = () => {
  const players = useEngine(getPlayersArray);
  const winners = useEngine(getWinners);
  const turnOrder = useEngine(getTurnOrder);
  const isHost = useEngine(getIsHost);
  const removePlayer = useEngine(getRemovePlayer);
  const gamePhase = useEngine(getPhase);
  const myPlayer = useEngine(getMyPlayer);

  const handleRemovePlayer = useCallback(
    (name: string) => {
      if (confirm(`Remove ${name} from the game and disconnect them?`))
        removePlayer(name);
    },
    [removePlayer]
  );

  return (
    <>
      <div className={styles.players}>
        {players.map(({ name, status, color, disconnected }) => {
          const tokenProps =
            gamePhase !== "joining" && status === "watching"
              ? { children: <span>👀 </span>, className: styles.watching_token }
              : {
                  className: cn(
                    styles.player_token,
                    color && styles[`player_token__${color}`],
                    color && styles[`player_token__color`]
                  ),
                };

          return (
            <div
              className={cn(
                styles.player_pill,
                color && styles[`player_pill__${color}`],
                turnOrder[0] === name && styles.player_pill__turn,
                disconnected && styles.player_pill__disconnected
              )}
              key={name}
            >
              {isHost && name !== myPlayer ? (
                <button
                  {...tokenProps}
                  className={cn(styles.remove_button, tokenProps.className)}
                  onClick={handleRemovePlayer.bind(null, name)}
                  title="Remove player"
                  aria-label="Remove player"
                />
              ) : (
                <div {...tokenProps} />
              )}
              {name} {winners.includes(name) && <>🏆</>}{" "}
              {status === "dead" && <>💩</>}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default memo(GameStatus);
