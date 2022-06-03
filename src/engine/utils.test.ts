import { describe, expect, it } from "vitest";
import { dealTiles, giveDragonToNextPlayer } from "./utils";

describe("deal tiles", () => {
  describe("when no one has a dragon", () => {
    it("starts with the first person in line", () => {
      const { deck, players } = dealTiles(
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        {
          foo: {
            name: "foo",
            color: "red",
            hand: [],
            status: "playing",
          },
          bar: {
            name: "bar",
            color: "orange",
            hand: [],
            status: "playing",
          },
          baz: {
            name: "baz",
            color: "blue",
            hand: [],
            status: "playing",
          },
        },
        ["foo", "bar", "baz"]
      );

      expect(deck).toEqual(["10", "11", "12"]);
      expect(players.foo.hand).toEqual(["1", "4", "7"]);
      expect(players.bar.hand).toEqual(["2", "5", "8"]);
      expect(players.baz.hand).toEqual(["3", "6", "9"]);
    });
  });
  describe("when someone has a dragon", () => {
    it("starts with the dragon holder and removes the dragon", () => {
      const { deck, players } = dealTiles(
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        {
          foo: {
            name: "foo",
            color: "red",
            hand: [],
            status: "playing",
          },
          bar: {
            name: "bar",
            color: "orange",
            hand: [],
            status: "playing",
            hasDragon: true,
          },
          baz: {
            name: "baz",
            color: "blue",
            hand: [],
            status: "playing",
          },
        },
        ["foo", "bar", "baz"]
      );

      expect(deck).toEqual(["10", "11", "12"]);
      expect(players.bar.hand).toEqual(["1", "4", "7"]);
      expect(players.baz.hand).toEqual(["2", "5", "8"]);
      expect(players.foo.hand).toEqual(["3", "6", "9"]);

      expect(players.bar.hasDragon).toBeFalsy();
    });
  });

  it("doesn't deal tiles to players out of the game", () => {
    const { deck, players } = dealTiles(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      {
        foo: {
          name: "foo",
          color: "red",
          hand: [],
          status: "playing",
        },
        bar: {
          name: "bar",
          color: "orange",
          hand: [],
          status: "watching",
        },
        baz: {
          name: "baz",
          color: "blue",
          hand: [],
          status: "dead",
        },
      },
      ["foo", "bar", "baz"]
    );

    expect(deck).toEqual(["4", "5", "6", "7", "8", "9", "10", "11", "12"]);
    expect(players.foo.hand).toEqual(["1", "2", "3"]);
    expect(players.bar.hand).toEqual([]);
    expect(players.baz.hand).toEqual([]);
  });

  it("doesn't deal more tiles to players with 3 tiles already", () => {
    const { deck, players } = dealTiles(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      {
        foo: {
          name: "foo",
          color: "red",
          hand: [],
          status: "playing",
        },
        bar: {
          name: "bar",
          color: "orange",
          hand: ["13", "14", "15"],
          status: "playing",
        },
        baz: {
          name: "baz",
          color: "blue",
          hand: [],
          status: "playing",
        },
      },
      ["foo", "bar", "baz"]
    );

    expect(deck).toEqual(["7", "8", "9", "10", "11", "12"]);
    expect(players.foo.hand).toEqual(["1", "3", "5"]);
    expect(players.bar.hand).toEqual(["13", "14", "15"]);
    expect(players.baz.hand).toEqual(["2", "4", "6"]);
  });

  it("gets the dragon assigned if the deck runs out before all players have enough tiles", () => {
    const { deck, players } = dealTiles(
      ["1", "2", "3", "4", "5", "6", "7"],
      {
        foo: {
          name: "foo",
          color: "red",
          hand: [],
          status: "playing",
        },
        bar: {
          name: "bar",
          color: "orange",
          hand: [],
          status: "playing",
        },
        baz: {
          name: "baz",
          color: "blue",
          hand: [],
          status: "playing",
        },
      },
      ["foo", "bar", "baz"]
    );

    expect(deck).toEqual([]);

    expect(players.foo.hand).toEqual(["1", "4", "7"]);
    expect(players.bar.hand).toEqual(["2", "5"]);
    expect(players.baz.hand).toEqual(["3", "6"]);

    expect(players.bar.hasDragon).toBeTruthy();
  });
  it("doesn't assign remove the dragon if it was already assigned and there are no tiles to be dealt", () => {
    const { deck, players } = dealTiles(
      [],
      {
        foo: {
          name: "foo",
          color: "red",
          hand: ["1"],
          status: "playing",
        },
        bar: {
          name: "ba,r",
          color: "orange",
          hand: ["2"],
          status: "playing",
          hasDragon: true,
        },
        baz: {
          name: "baz",
          color: "blue",
          hand: ["3"],
          status: "playing",
        },
      },
      ["foo", "bar", "baz"]
    );

    expect(deck).toEqual([]);

    expect(players.foo.hand).toEqual(["1"]);
    expect(players.bar.hand).toEqual(["2"]);
    expect(players.baz.hand).toEqual(["3"]);

    expect(players.bar.hasDragon).toBeTruthy();
  });
});

describe("give dragon to next player", () => {
  it("gives the dragon to the next player in turn", () => {
    const players = giveDragonToNextPlayer(
      "bar",
      {
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
          hand: [],
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
      ["foo", "bar", "baz"]
    );
    expect(players.bar.hasDragon).not.toBeTruthy();
    expect(players.baz.hasDragon).toBeTruthy();
  });
  it("does not give the dragon to the next player in turn if they have 3 tiles already", () => {
    const players = giveDragonToNextPlayer(
      "bar",
      {
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
          hand: [],
          status: "playing",
          coord: { notch: "2", row: 0, col: 0 },
          hasDragon: true,
        },
        baz: {
          name: "baz",
          color: "blue",
          hand: ["1", "2", "3"],
          status: "playing",
          coord: { notch: "4", row: 1, col: 1 },
        },
      },
      ["foo", "bar", "baz"]
    );
    expect(players.bar.hasDragon).not.toBeTruthy();
    expect(players.baz.hasDragon).not.toBeTruthy();
    expect(players.foo.hasDragon).toBeTruthy();
  });
});
