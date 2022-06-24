import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useEngine } from "../engine/store";
import { useCallback, useEffect, useState } from "react";
import { useIsMounted } from "../utils/hooks";
import {
  getHostId,
  getIsConnected,
  getIsHost,
  getJoinGame,
  getMyPlayer,
  getSetHostId,
  getSetIsHost,
} from "../engine/selectors";
import { cn } from "../utils/styles";
import Game from "../components/Game/Game";
import NameInput, { useNameInput } from "../components/NameInput/NameInput";

const Home: NextPage = () => {
  const router = useRouter();
  const myPlayer = useEngine(getMyPlayer);
  const joinGame = useEngine(getJoinGame);
  const hostId = useEngine(getHostId);
  const isHost = useEngine(getIsHost);
  const setHostId = useEngine(getSetHostId);
  const setIsHost = useEngine(getSetIsHost);
  const isConnected = useEngine(getIsConnected);
  const isMounted = useIsMounted();

  const gameId = router.query.gameId;
  const gameName = router.query.name;
  const isRouterReady = router.isReady;

  useEffect(() => {
    if (gameId && typeof gameId === "string" && gameName !== myPlayer) {
      setHostId(gameId);
      setIsHost(false);
    }
  }, [gameId, setHostId, gameName, myPlayer, setIsHost]);

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
        {(isHost || hostId) && myPlayer && isRouterReady ? (
          <Game />
        ) : (
          hostId &&
          isMounted && (
            <>
              <h1 className={styles.title}>Tsuro</h1>
              <form className={styles.home_container} onSubmit={handleJoin}>
                <NameInput
                  nameInput={nameInput}
                  nameError={nameError}
                  clearNameError={clearNameError}
                />
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
