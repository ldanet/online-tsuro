import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import TileShowcase from "../components/TileShowcase/TileShowcase";
import Button from "../components/Button";
import { useState } from "react";

const GamePage: NextPage = () => {
  const [key, setKey] = useState(0);
  const [animating, setAnimating] = useState(false);
  const refresh = () => setKey(Math.random());

  const handleAnimationStart = () => setAnimating(true);
  const handleAnimationEnd = () => setAnimating(false);

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

      <main className="relative flex h-full items-center justify-center overflow-clip">
        <TileShowcase
          key={key}
          onAnimationStart={handleAnimationStart}
          onAnimationEnd={handleAnimationEnd}
        />
        <Button
          className="absolute bottom-4 right-4 bg-tile"
          variant={animating ? "small" : "standard"}
          onClick={refresh}
        >
          🔄
        </Button>
      </main>
    </div>
  );
};

export default dynamic(() => Promise.resolve(GamePage), { ssr: false });
