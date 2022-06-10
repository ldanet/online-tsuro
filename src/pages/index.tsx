import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
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
            <NameInput
              nameInput={nameInput}
              nameError={nameError}
              clearNameError={clearNameError}
            />
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
