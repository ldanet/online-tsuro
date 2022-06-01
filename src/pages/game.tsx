import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Board from "../components/Board/Board";
import GameStatus from "../components/GameStatus/GameStatus";
import { useRouter } from "next/router";
import { useEngine } from "../engine/store";
import { useEffect, useState } from "react";
import { EngineState } from "../engine/types";
import { useNetwork } from "../engine/network";
import PlayerActions from "../components/PlayerActions/PlayerActions";
import ShareUrl from "../components/ShareUrl/ShareUrl";

const getHasGame = ({ isConnected, isLoading }: EngineState) =>
  isConnected || isLoading;

const Home: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const hasGame = useEngine(getHasGame);

  useNetwork();

  useEffect(() => {
    if (!hasGame && isMounted) {
      router.replace("/");
    }
  }, [hasGame, router, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Tsuro</title>
        <meta
          name="description"
          content="An online version of the board game Tsuro"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className={styles.main}>
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
      </main>
    </div>
  );
};

export default Home;
