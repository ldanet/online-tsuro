import { memo } from "react";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";
import { cn } from "../../utils/styles";
import styles from "./GameStatus.module.css";

const getPlayers = ({ players }: EngineState) => {
  return Object.values(players);
};
const getHostId = ({ hostId }: EngineState) => {
  return hostId;
};

const getResetGame = ({ resetGame }: EngineState) => resetGame;
const geStartGame = ({ startGame }: EngineState) => startGame;

const getPhase = ({ gamePhase }: EngineState) => gamePhase;
const getIsHost = ({ isHost }: EngineState) => isHost;
const getTurnOrder = ({ playerTurnsOrder }: EngineState) => playerTurnsOrder;

const GameStatus = () => {
  const players = useEngine(getPlayers);
  const hostId = useEngine(getHostId);
  const phase = useEngine(getPhase);

  const resetGame = useEngine(getResetGame);
  const startGame = useEngine(geStartGame);
  const isHost = useEngine(getIsHost);
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
            {status === "dead" && <>❌</>} {name}
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
