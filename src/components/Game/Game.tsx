import { memo } from "react";
import GameStatus from "../GameStatus/GameStatus";
import Board from "../Board/Board";
import PlayerActions from "../PlayerActions/PlayerActions";
import ShareUrl from "../ShareUrl/ShareUrl";
import { useNetwork } from "../../engine/network";

const Game = () => {
  useNetwork();

  return (
    <>
      <div className="mb-4 flex w-full flex-row flex-nowrap items-stretch justify-center gap-8">
        <h1 className="flex shrink grow-0 basis-[1] items-center justify-center">
          Tsuro
        </h1>
        <ShareUrl />
      </div>
      <div className="flex flex-col lg:flex-row-reverse">
        <GameStatus />
        <div>
          <Board />
          <PlayerActions />
        </div>
      </div>
    </>
  );
};

export default memo(Game);
