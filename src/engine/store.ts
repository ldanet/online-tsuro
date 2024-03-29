import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { EngineState } from "./types";
import { emptytBoard } from "./constants";
import {
  addPlayer,
  createGame,
  joinGame,
  pickColor,
  placePlayer,
  playSelectedTile,
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
    subscribeWithSelector((set) => ({
      deck: [],
      players: {},
      board: emptytBoard,
      gamePhase: "joining",
      playerTurnsOrder: [],
      availableColors: [],
      coloredPaths: [],
      winners: [],

      myPlayer: "",

      isLoading: false,
      isHost: false,
      hostConn: null,
      clientConns: {},

      // Actions
      setIsLoading: (isLoading) => {
        set({ isLoading });
      },
      setIsHost: (isHost) => {
        set({ isHost });
      },
      setHostId: (hostId) => {
        set({ hostId });
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
      setSelectedTile: (tile) => {
        set({ selectedTile: tile });
      },
      playTile: (player, tile) => {
        set((state) => playTile(state, player, tile));
      },
      playSelectedTile: () => {
        set((state) => playSelectedTile(state));
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
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => {
        let savedState: Partial<EngineState> = {
          ...state,
          players: Object.fromEntries(
            Object.entries(state.players).map(([name, player]) => [
              name,
              { ...player, disconnected: state.myPlayer !== name },
            ])
          ),
        };
        savedState = Object.fromEntries(
          Object.entries(savedState).filter(
            ([key]) =>
              !["hostConn", "clientConns", "hostId", "isLoading"].includes(key)
          )
        ) satisfies Partial<EngineState>;
        return savedState;
      },
    }
  )
);
