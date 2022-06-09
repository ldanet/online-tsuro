import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Board from "../components/Board/Board";
import GameStatus from "../components/GameStatus/GameStatus";
import { useRouter } from "next/router";
import { useEngine } from "../engine/store";
import { useCallback, useEffect, useState } from "react";
import { EngineState } from "../engine/types";
import { useNetwork } from "../engine/network";
import PlayerActions from "../components/PlayerActions/PlayerActions";
import ShareUrl from "../components/ShareUrl/ShareUrl";
import { useIsMounted, useNameInput } from "../utils/hooks";
import {
  getHostId,
  getIsConnected,
  getIsHost,
  getJoinGame,
  getMyPlayer,
  getSetHostId,
} from "../engine/selectors";
import { cn } from "../utils/styles";
import Game from "../components/Game/Game";

const Home: NextPage = () => {
  const router = useRouter();
  const myPlayer = useEngine(getMyPlayer);
  const joinGame = useEngine(getJoinGame);
  const hostId = useEngine(getHostId);
  const isHost = useEngine(getIsHost);
  const setHostId = useEngine(getSetHostId);
  const isConnected = useEngine(getIsConnected);
  const isMounted = useIsMounted();

  const gameId = router.query.gameId;
  const gameName = router.query.name;
  const isRouterReady = router.isReady;

  useEffect(() => {
    if (gameId && typeof gameId === "string") {
      setHostId(gameId);
    }
  }, [gameId, setHostId]);

  useEffect(() => {
    if (isRouterReady && isMounted && !isHost && !gameId && !hostId) {
      router.replace("/");
    }
  }, [isRouterReady, isMounted, hostId, router, isHost, gameId, isConnected]);

  const { nameInput, nameError, validateName, clearNameError } = useNameInput();

  const handleJoin = useCallback(() => {
    const hasNameError = !validateName();

    if (!hasNameError) {
      joinGame(nameInput.current!.value, hostId!);
    }
  }, [joinGame, validateName, hostId, nameInput]);

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
        {(isHost || hostId) && myPlayer && isMounted ? (
          <Game />
        ) : (
          hostId &&
          isMounted && (
            <>
              <h1 className={styles.title}>Tsuro</h1>
              <form className={styles.home_container} onSubmit={handleJoin}>
                <label className={styles.home_label} htmlFor="player-name">
                  Choose a nickname:
                </label>
                <input
                  className={styles.home_input}
                  id="player-name"
                  type="text"
                  ref={nameInput}
                  defaultValue={myPlayer ?? ""}
                  maxLength={12}
                  required
                  aria-describedby={nameError ? "name-error" : undefined}
                  placeholder="Enter your nickname"
                  onChange={clearNameError}
                />
                {nameError && (
                  <p className={styles.validation_error} id="name-error">
                    {nameError}
                  </p>
                )}
                {hostId && isMounted && (
                  <>
                    <button
                      className={cn(styles.home_button, styles.join_button)}
                      type="button"
                      onClick={handleJoin}
                    >
                      Join{gameName ? <> {gameName}&apos;s game</> : ""}
                    </button>
                  </>
                )}
              </form>
            </>
          )
        )}
      </main>
    </div>
  );
};

export default Home;
