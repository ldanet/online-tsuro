import { describe, expect, it, SpyInstanceFn, vi } from "vitest";
import { colors, emptytBoard } from "./constants";
import { addPlayer, createGame, movePlayers, startGame } from "./handlers";
import { useEngine } from "./store";
import { EngineState } from "./types";
import * as utils from "./utils";

vi.mock("./utils.ts", async () => {
  const actual = await vi.importActual("./utils.ts");
  return {
    ...(actual as any),
    shuffle: vi.fn(),
  };
});

(utils.shuffle as SpyInstanceFn).mockReturnValue([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
]);

const initialState = useEngine.getState();

const stateWithGame: EngineState = {
  ...initialState,
  deck: [
    "1",
    "27",
    "15",
    "20",
    "14",
    "35",
    "32",
    "28",
    "17",
    "6",
    "4",
    "13",
    "30",
    "12",
    "19",
    "21",
    "8",
  ],
  players: {
    foo: {
      name: "foo",
      status: "playing",
      hand: ["16", "7", "22"],
      color: "red",
      hasDragon: false,
      coord: {
        notch: "2",
        row: 4,
        col: 3,
      },
    },
    bar: {
      name: "bar",
      status: "playing",
      hand: ["10", "34", "2"],
      color: "purple",
      hasDragon: false,
      coord: {
        notch: "1",
        row: 1,
        col: 4,
      },
    },
    baz: {
      name: "baz",
      status: "playing",
      hand: ["18", "26", "25"],
      color: "orange",
      hasDragon: false,
      coord: {
        notch: "0",
        row: 1,
        col: 1,
      },
    },
  },
  playerTurnsOrder: ["foo", "bar", "baz"],
  board: [
    [
      null,
      null,
      null,
      {
        id: "5",
        combination: ["01", "24", "37", "56"],
      },
      {
        id: "29",
        combination: ["07", "14", "26", "35"],
      },
      null,
    ],
    [
      {
        id: "24",
        combination: ["03", "12", "47", "56"],
      },
      {
        id: "3",
        combination: ["07", "16", "23", "45"],
      },
      null,
      null,
      {
        id: "33",
        combination: ["04", "15", "27", "36"],
      },
      null,
    ],
    [
      {
        id: "9",
        combination: ["01", "26", "35", "47"],
      },
      null,
      null,
      null,
      null,
      null,
    ],
    [null, null, null, null, null, null],
    [
      null,
      null,
      null,
      {
        id: "23",
        combination: ["02", "17", "35", "46"],
      },
      null,
      null,
    ],
    [
      null,
      null,
      {
        id: "31",
        combination: ["04", "13", "26", "57"],
      },
      {
        id: "11",
        combination: ["01", "27", "34", "56"],
      },
      null,
      null,
    ],
  ],
  gamePhase: "main",
  availableColors: ["blue", "green", "yellow", "black", "white"],
  coloredPaths: [
    {
      pair: "31",
      row: 5,
      col: 2,
      color: "red",
    },
    {
      pair: "24",
      row: 0,
      col: 3,
      color: "purple",
    },
    {
      pair: "47",
      row: 2,
      col: 0,
      color: "orange",
    },
    {
      pair: "56",
      row: 5,
      col: 3,
      color: "red",
    },
    {
      pair: "07",
      row: 0,
      col: 4,
      color: "purple",
    },
    {
      pair: "21",
      row: 1,
      col: 0,
      color: "orange",
    },
    {
      pair: "20",
      row: 4,
      col: 3,
      color: "red",
    },
    {
      pair: "15",
      row: 1,
      col: 4,
      color: "purple",
    },
    {
      pair: "07",
      row: 1,
      col: 1,
      color: "orange",
    },
  ],
  winners: [],
};

describe("create game handler", () => {
  it("resets the game state correctly", () => {
    const newState = createGame(
      {
        ...initialState,
        players: {
          foo: {
            color: "black",
            name: "foo",
            status: "playing",
            hand: ["11", "6", "25"],
          },
        },
        hostId: "test-host-id",
        isHost: false,
        myPlayer: "foo",
        availableColors: ["blue", "green", "orange", "purple"],
        gamePhase: "main",
        winners: ["foo"],
        coloredPaths: [{ row: 3, col: 5, color: "black", pair: "04" }],
        playerTurnsOrder: ["foo"],
        board: [
          [null, null, { id: "14", combination: ["03", "25", "46", "17"] }],
        ],
      },
      "test"
    );

    expect(newState.players).toEqual({
      test: { name: "test", hand: [], status: "watching" },
    });
    expect(newState.myPlayer).toEqual("test");
    expect(newState.availableColors).toEqual(colors);
    expect(newState.playerTurnsOrder).toEqual([]);
    expect(newState.board).toEqual(emptytBoard);
    expect(newState.deck).toEqual([]);
    expect(newState.winners).toEqual([]);
    expect(newState.coloredPaths).toEqual([]);
    expect(newState.isHost).toEqual(true);
    expect(newState.gamePhase).toEqual("joining");
    expect(newState.hostId).toBeUndefined();
  });
});

describe("addPlayer", () => {
  it("adds a player correctly", () => {
    const newState = addPlayer(stateWithGame, "test", {
      blah: "Fake data connection",
    } as any);
    expect(newState.players!.test).toEqual({
      name: "test",
      hand: [],
      status: "watching",
    });
    expect(newState.clientConns!.test).toEqual({
      blah: "Fake data connection",
    });
  });
});

describe("startGame", () => {
  it("doesn't update the state if the host doesn't want to start with watching players", () => {
    window.confirm = vi.fn();
    (window.confirm as SpyInstanceFn).mockImplementationOnce(() => false);
    const newState = startGame({
      ...stateWithGame,
      players: {
        ...stateWithGame.players,
        bar: {
          ...stateWithGame.players.bar,
          hand: [],
          color: undefined,
          status: "watching",
        },
      },
    });
    expect(newState).toEqual({});
  });

  it("deals cards to the players", () => {
    const newState = startGame(stateWithGame);
    expect(newState.players!.foo.hand).toEqual(["1", "4", "7"]);
    expect(newState.players!.bar.hand).toEqual(["2", "5", "8"]);
    expect(newState.players!.baz.hand).toEqual(["3", "6", "9"]);
    expect(newState.deck).toEqual(["10", "11", "12", "13", "14"]);
  });

  it("adds players to the turn order", () => {
    const { playerTurnsOrder } = startGame(stateWithGame);
    expect(playerTurnsOrder).toContain("foo");
    expect(playerTurnsOrder).toContain("bar");
    expect(playerTurnsOrder).toContain("baz");
  });

  it("starts the game with the last winner going first", () => {
    const { playerTurnsOrder } = startGame({
      ...stateWithGame,
      winners: ["bar"],
    });
    expect(playerTurnsOrder![0]).toBe("bar");
  });

  it("only deals cards to the players in the game", () => {
    (window.confirm as SpyInstanceFn).mockImplementation(() => true);
    const newState = startGame({
      ...stateWithGame,
      players: {
        ...stateWithGame.players,
        bar: {
          ...stateWithGame.players.bar,
          hand: [],
          color: undefined,
          status: "watching",
        },
      },
    });
    expect(newState.players!.foo.hand).toEqual(["1", "3", "5"]);
    expect(newState.players!.bar.hand).toEqual([]);
    expect(newState.players!.baz.hand).toEqual(["2", "4", "6"]);
    expect(newState.deck).toEqual([
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
    ]);
  });

  it("clears the rest of the game state", () => {
    const newState = startGame(stateWithGame);

    Object.values(newState.players!).forEach((player) => {
      expect(player.hasDragon).toBeFalsy();
      expect(player.coord).toBeUndefined();
    });
    expect(newState.board).toEqual(emptytBoard);
    expect(newState.gamePhase).toEqual("round1");
    expect(newState.winners).toEqual([]);
    expect(newState.coloredPaths).toEqual([]);
  });

  it("asks for confirmation if not all players have colors", () => {
    window.confirm = vi.fn();
    (window.confirm as SpyInstanceFn).mockImplementation(() => true);
    startGame({
      ...stateWithGame,
      players: {
        ...stateWithGame.players,
        bar: {
          ...stateWithGame.players.bar,
          hand: [],
          color: undefined,
          status: "watching",
        },
      },
    });
    expect(window.confirm).toBeCalled();
  });

  it("adds players to the game only if they have chosen colors", () => {
    window.confirm = vi.fn();
    (window.confirm as SpyInstanceFn).mockImplementation(() => true);
    const newState = startGame({
      ...stateWithGame,
      players: {
        ...stateWithGame.players,
        bar: {
          ...stateWithGame.players.bar,
          hand: [],
          color: undefined,
          status: "watching",
        },
      },
    });
    expect(newState.players!.foo.status).toEqual("playing");
    expect(newState.players!.bar.status).toEqual("watching");
    expect(newState.players!.baz.status).toEqual("playing");
    expect(newState.playerTurnsOrder).toEqual(["foo", "baz"]);
  });
});

describe("movePlayers", () => {
  it("moves a single player to the right spot across a single tile", () => {
    const newState = movePlayers({
      ...initialState,
      board: [
        [null, { id: "1", combination: ["03", "12", "45", "67"] }, null],
        [null, { id: "2", combination: ["05", "12", "34", "67"] }, null],
        [null, null, null],
      ],
      gamePhase: "main",
      players: {
        foo: {
          name: "foo",
          color: "red",
          hand: [],
          status: "playing",
          coord: { notch: "5", row: 1, col: 1 },
        },
      },
      playerTurnsOrder: ["foo"],
    });

    expect(newState.players!.foo.coord).toEqual({ notch: "3", row: 0, col: 1 });
    expect(newState.coloredPaths).toContainEqual({
      pair: "03",
      row: 0,
      col: 1,
      color: "red",
    });
  });

  it("moves a single player to the right spot across a multiple tiles", () => {
    const newState = movePlayers({
      ...initialState,
      board: [
        [
          null,
          { id: "1", combination: ["03", "12", "45", "67"] },
          { id: "3", combination: ["06", "17", "23", "45"] },
        ],
        [
          null,
          { id: "2", combination: ["05", "12", "34", "67"] },
          { id: "4", combination: ["02", "15", "34", "67"] },
        ],
        [null, null, null],
      ],
      gamePhase: "main",
      players: {
        foo: {
          name: "foo",
          color: "red",
          hand: [],
          status: "playing",
          coord: { notch: "5", row: 1, col: 1 },
        },
      },
      playerTurnsOrder: ["foo"],
    });

    expect(newState.players!.foo.coord).toEqual({ notch: "1", row: 1, col: 2 });
    expect(newState.coloredPaths).toContainEqual({
      pair: "03",
      row: 0,
      col: 1,
      color: "red",
    });
    expect(newState.coloredPaths).toContainEqual({
      pair: "60",
      row: 0,
      col: 2,
      color: "red",
    });
    expect(newState.coloredPaths).toContainEqual({
      pair: "51",
      row: 1,
      col: 2,
      color: "red",
    });
  });

  it("moves multiple players to the right spot across a multiple tiles", () => {
    const newState = movePlayers({
      ...initialState,
      board: [
        [
          null,
          { id: "1", combination: ["03", "12", "45", "67"] },
          { id: "3", combination: ["06", "17", "23", "45"] },
        ],
        [
          null,
          { id: "2", combination: ["05", "12", "34", "67"] },
          { id: "4", combination: ["02", "15", "34", "67"] },
        ],
        [null, null, null],
      ],
      gamePhase: "main",
      players: {
        foo: {
          name: "foo",
          color: "red",
          hand: [],
          status: "playing",
          coord: { notch: "5", row: 1, col: 1 },
        },
        bar: {
          name: "bar",
          color: "blue",
          hand: [],
          status: "playing",
          coord: { notch: "4", row: 1, col: 1 },
        },
      },
      playerTurnsOrder: ["foo", "bar"],
    });

    expect(newState.players!.foo.coord).toEqual({ notch: "1", row: 1, col: 2 });
    expect(newState.players!.bar.coord).toEqual({ notch: "3", row: 1, col: 2 });
  });

  it("removes a player from the game when they go off the board and their tiles get distributed to other players", () => {
    const newState = movePlayers({
      ...initialState,
      board: [
        [
          null,
          { id: "1", combination: ["03", "12", "47", "56"] },
          { id: "3", combination: ["06", "17", "23", "45"] },
        ],
        [
          null,
          { id: "2", combination: ["05", "12", "34", "67"] },
          { id: "4", combination: ["02", "15", "34", "67"] },
        ],
        [null, null, null],
      ],
      gamePhase: "main",
      players: {
        foo: {
          name: "foo",
          color: "red",
          hand: [],
          status: "playing",
          coord: { notch: "5", row: 1, col: 1 },
        },
        bar: {
          name: "bar",
          color: "orange",
          hand: ["1", "2", "3"],
          status: "playing",
          coord: { notch: "2", row: 0, col: 0 },
          hasDragon: true,
        },
        baz: {
          name: "baz",
          color: "blue",
          hand: [],
          status: "playing",
          coord: { notch: "4", row: 1, col: 1 },
        },
      },
      playerTurnsOrder: ["foo", "bar", "baz"],
    });

    expect(newState.players!.bar.status).toBe("dead");
    expect(newState.playerTurnsOrder).toEqual(["foo", "baz"]);
    expect(newState.players!.baz.hand).toEqual(["1", "3"]);
    expect(newState.players!.foo.hand).toEqual(["2"]);
  });
});
