import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { hasProperty } from "../utils/types";
import { colors } from "./constants";
import {
  getHostId,
  getIsHost,
  getSetHostId,
  getSetIsConnected,
  getSetIsLoading,
  getSetPeer,
} from "./selectors";
import { useEngine } from "./store";
import { GameUpdateMessage, PlayerColor, SharedGameState } from "./types";
import { isBoardTile, isCoordinate, isGameUpdateMessage } from "./utils";

let peer: TPeer | null = null;

const broadcastGameUpdate = () => {
  const {
    deck,
    players,
    board,
    gamePhase,
    playerTurnsOrder,
    availableColors,
    coloredPaths,
    winners,
    clientConns,
  } = useEngine.getState();
  const gameUpdateMessage: GameUpdateMessage = {
    type: "gameUpdate",
    state: {
      deck,
      players,
      playerTurnsOrder,
      board,
      gamePhase,
      availableColors,
      coloredPaths,
      winners,
    },
  };
  Object.values(clientConns).forEach((conn) => {
    conn.send(gameUpdateMessage);
  });
};

let unsubGameUpdate: (() => void) | null = null;

const host = () => {
  const { peer } = useEngine.getState();
  peer?.on("open", (hostId) => {
    console.log("hostId: ", hostId);
    if (typeof hostId === "string") useEngine.setState({ hostId });

    useEngine.setState({ isConnected: true, isLoading: false });
  });

  unsubGameUpdate = useEngine.subscribe(
    (state) => [
      state.deck,
      state.players,
      state.board,
      state.gamePhase,
      state.playerTurnsOrder,
      state.availableColors,
    ],
    broadcastGameUpdate
  );

  peer?.on("connection", (conn) => {
    // Keep player name
    let name: string;
    conn.on("data", (message) => {
      if (hasProperty(message, "type")) {
        switch (message.type) {
          case "handShake": {
            if (
              hasProperty(message, "name") &&
              message.name &&
              typeof message.name === "string"
            ) {
              const { players, myPlayer } = useEngine.getState();
              // In case player with same name already exists
              if (Object.keys(players).includes(message.name)) {
                if (
                  message.name !== myPlayer &&
                  (players[message.name].disconnected ||
                    confirm(
                      `Another player named ${message.name} wishes to join the game. Press OK to let them take over ${message.name}'s seat or cancel to ask them to pick a different name.`
                    ))
                ) {
                  name = message.name;
                  // Replace player's connection
                  useEngine.getState().clientConns[name]?.close();
                  useEngine.setState((state) => ({
                    clientConns: { ...state.clientConns, [name]: conn },
                    players: {
                      ...state.players,
                      [name]: { ...state.players[name], disconnected: false },
                    },
                  }));
                  conn.send({
                    type: "welcome",
                    hostName: useEngine.getState().hostName,
                  });
                } else {
                  conn.send({ type: "nameTaken" });
                  return;
                }
              } else {
                name = message.name;
                useEngine.getState().addPlayer(message.name, conn);

                conn.send({
                  type: "welcome",
                  hostName: useEngine.getState().hostName,
                });
              }
            }
            break;
          }
          case "pickColor": {
            if (
              hasProperty(message, "color") &&
              colors.includes(message.color as PlayerColor)
            ) {
              const color = message.color as PlayerColor;
              if (!useEngine.getState().availableColors.includes(color)) {
                conn.send({
                  type: "error",
                  message: `Someone already picked ${color}. Please choose a different color.`,
                });
              }
              useEngine
                .getState()
                .pickColor(name, message.color as PlayerColor);
            }
            break;
          }
          case "placePlayer": {
            if (hasProperty(message, "coord") && isCoordinate(message.coord)) {
              useEngine.getState().placePlayer(name, message.coord);
            }
            break;
          }
          case "playTile": {
            if (hasProperty(message, "tile") && isBoardTile(message.tile)) {
              useEngine.getState().playTile(name, message.tile);
            }
            break;
          }
        }
      }
    });

    conn.on("close", () => {
      useEngine.setState((state) => ({
        players: {
          ...state.players,
          [name]: { ...state.players[name], disconnected: true },
        },
      }));
    });
  });
};

const join = (hostId: string) => {
  const { peer, myPlayer } = useEngine.getState();
  if (peer) {
    peer?.on("open", () => {
      const conn = peer.connect(hostId, { reliable: true });

      useEngine.setState({ hostConn: conn });
      conn.on("open", () => {
        conn.send({ type: "handShake", name: myPlayer });

        conn.on("data", (message) => {
          // shouldn't happen, doesn't make sense
          if (useEngine.getState().isHost) return;

          if (isGameUpdateMessage(message)) {
            const { state } = message;
            // Ensure we're not adding any unverified data to the store
            const update: SharedGameState = {
              deck: state.deck,
              players: state.players,
              board: state.board,
              gamePhase: state.gamePhase,
              playerTurnsOrder: state.playerTurnsOrder,
              availableColors: state.availableColors,
              coloredPaths: state.coloredPaths,
              winners: state.winners,
            };

            const isGamePhaseChange =
              useEngine.getState().gamePhase !== state.gamePhase;
            if (isGamePhaseChange) {
              // Clear selected tile so it doesn't hang around from previous games
              useEngine.setState({ ...update, selectedTile: undefined });
            } else {
              useEngine.setState(update);
            }
          }
          if (hasProperty(message, "type")) {
            if (
              message.type === "welcome" &&
              hasProperty(message, "hostName") &&
              typeof message.hostName === "string"
            ) {
              useEngine.setState({
                isConnected: true,
                isLoading: false,
                hostName: message.hostName,
              });
            }
            if (
              message.type === "error" &&
              hasProperty(message, "message") &&
              typeof message.message === "string"
            ) {
              alert(message.message);
            }
            if (message.type === "nameTaken") {
              let newName = prompt(
                "Your name is already taken, please enter a different name:"
              );
              if (newName) {
                useEngine.setState((state) => ({
                  myPlayer: newName!,
                  players: {
                    ...state.players,
                    [newName!]: {
                      name: newName!,
                      status: "watching",
                      hand: [],
                    },
                  },
                }));
                conn.send({ type: "handShake", name: newName });
              } else {
                // Kicks the player out
                conn.close();
              }
            }
          }
        });

        conn.on("close", () => {
          alert("You have been disconnected.");
          useEngine.setState({ isConnected: false });
        });
      });
    });
  }
};

export const useNetwork = () => {
  const importingPeer = useRef(false);
  const setPeer = useEngine(getSetPeer);
  const isHost = useEngine(getIsHost);
  const hostId = useEngine(getHostId);
  const setIsConnected = useEngine(getSetIsConnected);
  const setIsLoading = useEngine(getSetIsLoading);
  const setHostId = useEngine(getSetHostId);

  const router = useRouter();

  useEffect(() => {
    if ((!peer || peer.destroyed) && !importingPeer.current) {
      setIsLoading(true);
      importingPeer.current = true;
      const fn = async () => {
        const { default: PeerJs } = await import("peerjs");
        importingPeer.current = false;
        peer = new PeerJs({
          debug: process.env.NODE_ENV === "production" ? 0 : 3,
        });

        setPeer(peer);

        if (isHost) {
          host();
        } else if (hostId) {
          join(hostId);
        } else {
          router.replace("/");
        }

        peer.on("error", (error) => {
          if ((error as any).type === "peer-unavailable") {
            alert("This game ID does not exist.");
          }
          console.error(error);
          setIsConnected(false);
          setIsLoading(false);
          router.replace("/");
        });

        peer.on("disconnected", () => {
          setIsConnected(false);
        });
      };
      fn();
    }
  }, [
    setPeer,
    isHost,
    hostId,
    setIsConnected,
    setIsLoading,
    setHostId,
    router,
  ]);

  useEffect(() => {
    return () => {
      if (!importingPeer.current && peer) {
        // destroy peer when leaving the page
        peer.destroy();
        // unsubscribe host
        unsubGameUpdate && unsubGameUpdate();

        setIsConnected(false);
      }
      if (isHost) {
        setHostId(undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
