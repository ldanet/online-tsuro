import "../styles/styles.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useEngine } from "../engine/store";
import { getSetHostId } from "../engine/selectors";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const gameId = router.query.gameId;
  const setHostId = useEngine(getSetHostId);

  useEffect(() => {
    if (gameId && typeof gameId === "string") {
      setHostId(gameId);
    }
  }, [gameId, setHostId]);

  return <Component {...pageProps} />;
}

export default MyApp;
