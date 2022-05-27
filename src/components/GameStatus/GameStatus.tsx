import { memo } from "react";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";

const getPlayers = ({ players, playerTurnsOrder }: EngineState) => {
  return playerTurnsOrder.map((name) => players[name]);
};

const GameStatus = () => {
  const players = useEngine(getPlayers);
  return (
    <>
      {players.map(({ name, status }) => (
        <div key={name}>
          {name} {status === "dead" && <>❌</>}
        </div>
      ))}
    </>
  );
};

export default memo(GameStatus);
