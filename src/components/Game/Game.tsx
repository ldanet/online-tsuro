import { useIsMounted } from "../../utils/hooks";
import styles from "../../styles/Home.module.css";
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
      <div className={styles.game_header}>
        <h1 className={styles.title}>Tsuro</h1>
        {isMounted && <ShareUrl />}
      </div>
      {/* Prevent game from pre-rendering on server as rehydration will fail because of session storage state */}
      {isMounted && (
        <>
          <GameStatus />
          <Board />
          <PlayerActions />
        </>
      )}
    </>
  );
};

export default memo(Game);
