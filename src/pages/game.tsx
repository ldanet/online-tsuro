import type { NextPage } from "next";
import Head from "next/head";
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
import TileShowcase from "../components/TileShowcase/TileShowcase";

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
    <div className="h-full">
      <Head>
        <title>Tsuro</title>
        <meta
          name="description"
          content="An online version of the Tsuro board game"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className="flex h-full">
        {hasGame ? (
          <Game />
        ) : (
          hasGameId && (
            <>
              <div
                role="presentation"
                className="hidden w-full place-items-center overflow-clip bg-orange-800 lg:grid"
              >
                <TileShowcase />
              </div>
              <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center space-y-4 p-4">
                <h1 className="text-5xl font-extrabold">Tsuro</h1>
                <form
                  onSubmit={handleJoin}
                  className="w-[380px] max-w-full space-y-4 rounded-xl border-2 border-orange-800 p-4"
                >
                  <h2 className="text-center text-2xl">
                    Join {gameName ? `${gameName}'s` : "a"} game
                  </h2>
                  <NameInput
                    nameInput={nameInput}
                    nameError={nameError}
                    clearNameError={clearNameError}
                  />
                  <Button type="submit" fullSize disabled={!isRouterReady}>
                    Enter game room
                  </Button>
                </form>
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
};

export default dynamic(() => Promise.resolve(GamePage), { ssr: false });
