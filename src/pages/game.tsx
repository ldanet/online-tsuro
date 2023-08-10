import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useEngine } from "../engine/store";
import { FormEvent, useCallback, useEffect } from "react";
import {
  getHostId,
  getIsHost,
  getJoinGame,
  getMyPlayer,
  getSetIsHost,
} from "../engine/selectors";
import NameInput, { useNameInput } from "../components/NameInput/NameInput";
import Button from "../components/Button";
import { cn } from "../utils/styles";
import dynamic from "next/dynamic";
import Game from "../components/Game/Game";

const GamePage: NextPage = () => {
  const router = useRouter();
  const myPlayer = useEngine(getMyPlayer);
  const joinGame = useEngine(getJoinGame);
  const hostId = useEngine(getHostId);
  const isHost = useEngine(getIsHost);
  const setIsHost = useEngine(getSetIsHost);

  const gameId = router.query.gameId;
  const gameName = router.query.name;
  const isRouterReady = router.isReady;

  const hasGame = isHost || hostId;
  const hasGameId = isRouterReady && gameId;

  useEffect(() => {
    if (gameId && typeof gameId === "string" && gameName !== myPlayer) {
      setIsHost(false);
    }
  }, [gameId, gameName, myPlayer, setIsHost]);

  useEffect(() => {
    if (!hasGame && !hasGameId && isRouterReady) {
      router.replace("/");
    }
  }, [hasGame, router, hasGameId, isRouterReady]);

  const { nameInput, nameError, validateName, clearNameError } = useNameInput();

  const handleJoin = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const hasNameError = !validateName();

      if (!hasNameError && typeof gameId === "string") {
        joinGame(nameInput.current!.value, gameId);
      }
    },
    [joinGame, validateName, gameId, nameInput]
  );

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
        {hasGame ? (
          <Game />
        ) : (
          hasGameId && (
            <>
              <h1 className={styles.title}>Tsuro</h1>
              <form className={styles.home_container} onSubmit={handleJoin}>
                <NameInput
                  nameInput={nameInput}
                  nameError={nameError}
                  clearNameError={clearNameError}
                />
                <Button
                  type="submit"
                  className="mt-4"
                  disabled={!isRouterReady}
                >
                  Join{gameName ? ` ${gameName}'s game` : ""}
                </Button>
              </form>
            </>
          )
        )}
      </main>
    </div>
  );
};

export default dynamic(() => Promise.resolve(GamePage), { ssr: false });
