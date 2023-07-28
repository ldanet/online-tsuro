import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useEngine } from "../engine/store";
import { useCallback, useEffect } from "react";
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
import Game from "../components/Game/Game";
import NameInput, { useNameInput } from "../components/NameInput/NameInput";
import Button from "../components/Button";
import { cn } from "../utils/styles";

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
    <div
      className={cn(
        styles.container,
        "min-h-[100dvh] bg-orange-200 text-orange-800"
      )}
    >
      <Head>
        <title>Tsuro</title>
        <meta
          name="description"
          content="An online version of the Tsuro board game"
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
                  <Button type="submit" className="mt-4">
                    Join{gameName ? ` ${gameName}'s game` : ""}
                  </Button>
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
