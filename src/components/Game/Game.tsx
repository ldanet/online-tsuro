import { useIsMounted } from "../../utils/hooks";
import { memo, useEffect } from "react";
import GameStatus from "../GameStatus/GameStatus";
import Board from "../Board/Board";
import PlayerActions from "../PlayerActions/PlayerActions";
import ShareUrl from "../ShareUrl/ShareUrl";
import { useNetwork } from "../../engine/network";
import { useRouter } from "next/router";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";

const getHasGame = ({ isConnected, isLoading, isOffline }: EngineState) =>
  isConnected || isLoading || isOffline;

const Game = () => {
  const router = useRouter();
  const hasGame = useEngine(getHasGame);
  const isMounted = useIsMounted();

  useNetwork();

  useEffect(() => {
    if (!hasGame && isMounted) {
      router.replace("/");
    }
  }, [hasGame, router, isMounted]);

  return (
    <>
      <div className="mb-4 flex w-full flex-row flex-nowrap items-stretch justify-center gap-8">
        <h1 className="flex shrink grow-0 basis-[1] items-center justify-center">
          Tsuro
        </h1>
        {isMounted && <ShareUrl />}
      </div>
      {/* Prevent game from pre-rendering on server as rehydration will fail because of session storage state */}
      {isMounted && (
        <div className="flex flex-col lg:flex-row-reverse">
          <GameStatus />
          <div>
            <Board />
            <PlayerActions />
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Game);
