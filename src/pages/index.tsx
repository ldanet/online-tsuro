import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEngine } from "../engine/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  getCreateGame,
  getHostId,
  getJoinGame,
  getMyPlayer,
  getSetHostId,
} from "../engine/selectors";
import { useIsMounted, useNameInput } from "../utils/hooks";
import { cn } from "../utils/styles";

const Home: NextPage = () => {
  const router = useRouter();
  const createGame = useEngine(getCreateGame);
  const myPlayer = useEngine(getMyPlayer);

  const { nameInput, nameError, validateName, clearNameError } = useNameInput();

  const handleHost = useCallback(() => {
    if (validateName()) {
      createGame(nameInput.current!.value);
      router.push("/game");
    }
  }, [router, createGame, validateName, nameInput]);

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
        <form className={styles.home_container} onSubmit={handleHost}>
          <fieldset className={styles.home_fieldset}>
            <legend className={styles.home_legend}>Host a new game</legend>
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
            <button
              className={styles.home_button}
              onClick={handleHost}
              type="button"
            >
              New game room
            </button>
          </fieldset>
          <p>
            Trying to join an existing game? Ask the host or other players in
            the game for the link!
          </p>
        </form>
      </main>
    </div>
  );
};

export default Home;
