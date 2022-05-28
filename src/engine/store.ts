import Peer from "peerjs";
import create from "zustand";
import { persist } from "zustand/middleware";
import { EngineState } from "./types";
import { TileID, tiles } from "../constants/tiles";
import { getNextTileCoordinate, shuffle } from "./utils";
import { emptytBoard } from "./constants";
import { createGame, placePlayer, playTile, resetGame } from "./handlers";

export const useEngine = create<
  EngineState,
  [["zustand/persist", Partial<EngineState>]]
>(
  persist(
    (set, get) => ({
      deck: [],
      players: {},
      playerTurnsOrder: [],
      gamePhase: "joining",
      board: emptytBoard,
      host: "",
      myPlayer: "",
      // peer: new Peer(),
      createGame: (name) => {
        set(createGame(name));
      },
      selectTile: (tile) => {
        set({ selectedTile: tile });
      },
      playTile: (player, tile) => {
        set((state) => playTile(state, player, tile));
      },
      resetGame: () => {
        set(resetGame);
      },
      placePlayer: (coord) => {
        set((state) => placePlayer(state, coord));
      },
    }),
    { name: "tsuro-game" }
  )
);
