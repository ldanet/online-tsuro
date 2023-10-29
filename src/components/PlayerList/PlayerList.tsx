import { memo, useCallback } from "react";
import {
  getIsHost,
  getMyPlayer,
  getPlayersArray,
  getRemovePlayer,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { GameStatusPlayer } from "../GameStatus/GameStatus";
import ShareUrl from "../ShareUrl/ShareUrl";

const PlayerList = () => {
  const players = useEngine(getPlayersArray);
  const removePlayer = useEngine(getRemovePlayer);
  const myPlayer = useEngine(getMyPlayer);
  const isHost = useEngine(getIsHost);

  const handleRemovePlayer = useCallback(
    (name: string) => {
      if (confirm(`Remove ${name} from the game and disconnect them?`))
        removePlayer(name);
    },
    [removePlayer]
  );

  return (
    <>
      {players.map((player) => (
        <GameStatusPlayer
          key={player.name}
          player={player}
          displayNameOverride={
            player.name === myPlayer ? `${player.name} (you)` : undefined
          }
          handleRemovePlayer={
            isHost && player.name !== myPlayer ? handleRemovePlayer : undefined
          }
        />
      ))}
      <ShareUrl />
    </>
  );
};

export default memo(PlayerList);
