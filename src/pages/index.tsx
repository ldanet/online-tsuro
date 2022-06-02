import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEngine } from "../engine/store";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  getCreateGame,
  getHostId,
  getJoinGame,
  getMyPlayer,
} from "../engine/selectors";

const Home: NextPage = () => {
  const router = useRouter();
  const nameInput = useRef<HTMLInputElement>(null);
  const gameIdInput = useRef<HTMLInputElement>(null);
  const createGame = useEngine(getCreateGame);
  const joinGame = useEngine(getJoinGame);
  const myPlayer = useEngine(getMyPlayer);
  const hostId = useEngine(getHostId);

  const [nameError, setNameError] = useState<string>();
  const [gameIdError, setGameIdError] = useState<string>();

  const validateName = useCallback(() => {
    if (!nameInput.current?.value) {
      setNameError("Please enter your a nickname to start playing.");
      nameInput.current?.focus();
      return false;
    } else if (nameInput.current.value.length > 12) {
      setNameError("Your name must be 12 characters or shorter");
    }
    return true;
  }, []);

  const handleClickHost = useCallback(() => {
    if (validateName()) {
      createGame(nameInput.current!.value);
      router.push("/game");
    }
  }, [router, createGame, validateName]);

  const handleClickJoin = useCallback(() => {
    let hasGameIdError = false;
    if (!gameIdInput.current?.value) {
      setGameIdError("Please enter the ID for the game you wish to join.");
      gameIdInput.current?.focus();
      hasGameIdError = true;
    }
    const hasNameError = !validateName();

    if (!hasNameError && !hasGameIdError) {
      joinGame(nameInput.current!.value, gameIdInput.current!.value);
      router.push("/game");
    }
  }, [router, joinGame, validateName]);

  const clearNameError = useCallback(() => {
    setNameError(undefined);
  }, []);
  const clearGameIdError = useCallback(() => {
    setGameIdError(undefined);
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
        <h1 className={styles.title}>Tsuro</h1>
        <form>
          <label htmlFor="player-name">Choose a nickname</label>:{" "}
          <input
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
          <fieldset>
            <legend>Join existing game</legend>
            <label htmlFor="game-id">Game ID</label>:{" "}
            <input
              id="game-id"
              type="text"
              ref={gameIdInput}
              defaultValue={hostId ?? ""}
              aria-describedby={gameIdError ? "game-id-error" : undefined}
              onChange={clearGameIdError}
            />
            <button type="button" onClick={handleClickJoin}>
              Join
            </button>
            {gameIdError && (
              <p className={styles.validation_error} id="game-id-error">
                {gameIdError}
              </p>
            )}
          </fieldset>
          <fieldset>
            <legend>Host a new game</legend>

            <button onClick={handleClickHost} type="button">
              New game room
            </button>
          </fieldset>
        </form>
        {/* <h2>How is your data used?</h2>
        <p>
          Your name will only be used for display on the screen of player&apos;s
          who have joined the same game as you. It will be stored temporarily in
          their browser along with the moves you make in game for the game to
          work. This data will not be sent to or stored on any server.
        </p> */}
      </main>
    </div>
  );
};

export default Home;
