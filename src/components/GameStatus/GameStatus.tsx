import { memo } from "react";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";

const getPlayers = ({ players }: EngineState) => {
  return Object.values(players);
};

const GameStatus = () => {
  const players = useEngine(getPlayers);
  return (
    <>
      {players.map(({ name, status }) => (
        <div key={name}>
          {status === "dead" && <>❌</>} {name}
        </div>
      ))}
    </>
  );
};

export default memo(GameStatus);
