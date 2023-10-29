import { memo, useCallback, useState } from "react";
import GameStatus from "../GameStatus/GameStatus";
import Board from "../Board/Board";
import PlayerActions from "../PlayerActions/PlayerActions";
import { useNetwork } from "../../engine/network";
import Button from "../Button";
import { cn } from "../../utils/styles";
import PlayerList from "../PlayerList/PlayerList";

const Game = () => {
  useNetwork();
  const [showingPlayerList, setShowingPlayerList] = useState(false);

  const togglePlayerList = useCallback(
    () => setShowingPlayerList((showing) => !showing),

    []
  );

  return (
    <div className="relative flex flex-1">
      <div className="flex h-full w-full flex-col items-stretch">
        <div className="flex items-center justify-items-stretch gap-4 bg-orange-100 px-4 py-2 shadow-sm">
          <h1 className="text-2xl">Tsuro</h1>
          <GameStatus />
          <Button
            className="lg:hidden"
            onClick={togglePlayerList}
            type="button"
          >
            Players
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <Board />
          <PlayerActions />
        </div>
      </div>
      <div
        className={cn(
          showingPlayerList ? "block" : "hidden",
          "absolute bottom-0 left-0 right-0 top-0"
        )}
        onClick={togglePlayerList}
      />
      <div
        className={cn(
          showingPlayerList ? "flex shadow-lg" : "hidden",
          "absolute bottom-0 right-0 top-0 w-fit max-w-[30rem] flex-col gap-4 bg-orange-100 p-4 text-left lg:relative lg:flex"
        )}
      >
        <PlayerList />
      </div>
    </div>
  );
};

export default memo(Game);
