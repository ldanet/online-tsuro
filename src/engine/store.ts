import create from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { EngineState } from "./types";
import { emptytBoard } from "./constants";
import {
  addPlayer,
  createGame,
  joinGame,
  pickColor,
  placePlayer,
  playTile,
  removePlayer,
  resetGame,
  startGame,
} from "./handlers";

export const useEngine = create<
  EngineState,
  [
    ["zustand/persist", Partial<EngineState>],
    ["zustand/subscribeWithSelector", Partial<EngineState>]
  ]
>(
  persist(
    subscribeWithSelector((set, get) => ({
      deck: [],
      players: {},
      board: emptytBoard,
      gamePhase: "joining",
      playerTurnsOrder: [],
      availableColors: [],
      winners: [],

      myPlayer: "",

      isLoading: false,
      isConnected: false,
      peer: null,
      isHost: false,
      hostConn: null,
      clientConns: {},

      // Actions
      setPeer: (peer) => {
        set({ peer });
      },
      setIsLoading: (isLoading) => {
        set({ isLoading });
      },
      setIsConnected: (isConnected) => {
        set({ isConnected });
      },
      createGame: (name) => {
        set((state) => createGame(state, name));
      },
      resetGame: () => {
        set(resetGame);
      },
      startGame: () => {
        set(startGame);
      },
      joinGame: (name, hostId) => {
        set((state) => joinGame(state, name, hostId));
      },
      addPlayer: (name, conn) => {
        set((state) => addPlayer(state, name, conn));
      },
      selectTile: (tile) => {
        set({ selectedTile: tile });
      },
      playTile: (player, tile) => {
        set((state) => playTile(state, player, tile));
      },
      placePlayer: (player, coord) => {
        set((state) => placePlayer(state, player, coord));
      },
      pickColor: (player, color) => {
        set((state) => pickColor(state, player, color));
      },
      removePlayer: (player) => {
        set((state) => removePlayer(state, player));
      },
    })),
    {
      name: "tsuro-game",
      getStorage: () => sessionStorage,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["peer", "hostConn", "clientConns"].includes(key)
          )
        ),
    }
  )
);
