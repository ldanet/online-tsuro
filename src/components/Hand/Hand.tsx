import { memo, useCallback, useState } from "react";
import { TileType, tiles } from "../../constants/tiles";
import {
  getAvailableColors,
  getIsLoading,
  getIsMyTurn,
  getMyPlayerData,
  getPhase,
  getPlayTile,
  getSelectedTile,
  getSelectTile,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";
import Tile from "../Tile/Tile";
import styles from "./Hand.module.css";

export const getHand = ({ players, myPlayer }: EngineState) => {
  const hand = players[myPlayer]?.hand;
  return hand?.map((id) => tiles[id]);
};

const Hand = () => {
  const hand = useEngine(getHand);
  const myName = useEngine(useCallback(({ myPlayer }) => myPlayer, []));
  const isMyTurn = useEngine(getIsMyTurn);
  const selectedTile = useEngine(getSelectedTile);
  const isLoading = useEngine(getIsLoading);

  const phase = useEngine(getPhase);

  const selectTile = useEngine(getSelectTile);
  const playTile = useEngine(getPlayTile);
  const availableColors = useEngine(getAvailableColors);
  const me = useEngine(getMyPlayerData);

  const [rotations, setRotations] = useState<number[]>([]);

  const onTileClick = useCallback(
    (index: number, { id, combinations }: TileType) => {
      let combinationIndex = (rotations[index] ?? 0) % combinations.length;

      if (selectedTile?.id === id) {
        const newRotations = [...rotations];
        combinationIndex = newRotations[index] =
          (combinationIndex + 1) % combinations.length;
        setRotations(newRotations);
      }
      selectTile &&
        selectTile({
          id: id,
          combination: combinations[combinationIndex],
        });
    },
    [selectTile, rotations, selectedTile]
  );

  const onPlayClick = useCallback(() => {
    playTile && selectedTile && playTile(myName, selectedTile);
  }, [myName, playTile, selectedTile]);

  if (isLoading) {
    return <p>Connecting...</p>;
  }

  return (
    <>
      {phase === "joining" &&
        (me.color ? (
          <p>Waiting for the game to start</p>
        ) : availableColors.length ? (
          <p>Please choose a color</p>
        ) : (
          <p>Sorry, the game is full. You can still watch!</p>
        ))}
      {phase === "round1" &&
        me.color &&
        (isMyTurn ? (
          <p>It&apos;s your turn! Pick a notch on the edge of the board</p>
        ) : (
          <p>Wait for your turn</p>
        ))}
      {phase === "main" && (
        <div className={styles.hand}>
          {isMyTurn ? (
            <button
              type="button"
              onClick={onPlayClick}
              disabled={!(selectedTile && isMyTurn)}
            >
              Play selected tile
            </button>
          ) : (
            <p className="hint">Wait for you turn</p>
          )}
          <div className={styles.handTiles}>
            {hand?.map((tile, i) =>
              tile ? (
                <button
                  key={tile.id}
                  className={[
                    styles.tileButton,
                    selectedTile?.id === tile.id
                      ? styles["tileButton--selected"]
                      : "",
                  ].join(" ")}
                  type="button"
                  onClick={onTileClick.bind(null, i, tile)}
                  title="Click to select, click again to rotate"
                >
                  <svg className={styles.tileSvg} viewBox="0 0 40 40">
                    <g filter="url(#tile-shadow)" transform="translate(5 5)">
                      <Tile
                        combination={
                          tile.combinations[
                            (rotations[i] ?? 0) % tile.combinations.length
                          ]
                        }
                        withEdge={selectedTile?.id === tile.id}
                      />
                    </g>
                  </svg>
                </button>
              ) : null
            )}
          </div>
          <p className={styles.hint}>
            Click on a tile to select it and click again to rotate
          </p>
        </div>
      )}
    </>
  );
};

export default memo(Hand);
