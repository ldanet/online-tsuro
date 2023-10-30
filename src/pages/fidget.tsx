import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import TileShowcase from "../components/TileShowcase/TileShowcase";
import Button from "../components/Button";
import { useState } from "react";

const GamePage: NextPage = () => {
  const [key, setKey] = useState(0);
  const refresh = () => setKey(Math.random());
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
        <TileShowcase key={key} />
        <Button className="absolute bottom-4 right-4 bg-tile" onClick={refresh}>
          🔄
        </Button>
      </main>
    </div>
  );
};

export default dynamic(() => Promise.resolve(GamePage), { ssr: false });
