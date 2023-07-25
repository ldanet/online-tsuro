import type { NextPage } from "next";
import Head from "next/head";
import { useEngine } from "../engine/store";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { getCreateGame } from "../engine/selectors";
import NameInput, { useNameInput } from "../components/NameInput/NameInput";

const Home: NextPage = () => {
  const router = useRouter();
  const createGame = useEngine(getCreateGame);

  const { nameInput, nameError, validateName, clearNameError } = useNameInput();

  const handleHost = useCallback(() => {
    if (validateName()) {
      createGame(nameInput.current!.value);
      router.push("/game");
    }
  }, [router, createGame, validateName, nameInput]);

  return (
    <div className="flex">
      <Head>
        <title>Tsuro</title>
        <meta
          name="description"
          content="An online version of the board game Tsuro"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center space-y-4 bg-orange-200 p-4 text-orange-800">
        <h1 className="text-5xl font-extrabold">Tsuro</h1>
        <form
          className="rounded-xl border-2 border-orange-800"
          onSubmit={handleHost}
        >
          <fieldset className="m-4">
            <legend className="text-center text-2xl">Host a new game</legend>
            <NameInput
              nameInput={nameInput}
              nameError={nameError}
              clearNameError={clearNameError}
            />
            <button
              className="w-full mt-4 rounded-xl border-2 border-orange-800 py-3 text-lg text-orange-800 hover:bg-orange-800 hover:text-orange-50"
              onClick={handleHost}
              type="button"
            >
              New game room
            </button>
          </fieldset>
        </form>
        <p className="text-orange-700 text-center">
          Trying to join an existing game? Ask the host or other players in the
          game for the link!
        </p>
      </main>
      <div
        role="presentation"
        className="hidden w-full bg-orange-800 px-8 place-items-center text-8xl text-orange-50 xl:grid place-items-center"
      >
        Play with your friends, without limits.
      </div>
    </div>
  );
};

export default Home;
