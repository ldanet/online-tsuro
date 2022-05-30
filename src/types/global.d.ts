import Peer, { DataConnection } from "peerjs";

export {};

declare global {
  type TPeer = Peer;
  type TDataConnection = DataConnection;
}
