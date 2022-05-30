import { memo, useCallback, useState } from "react";
import { TileType, tiles } from "../../constants/tiles";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";
import Tile from "../Tile/Tile";
import styles from "./Hand.module.css";

const getHand = ({ players, myPlayer }: EngineState) => {
  const hand = players[myPlayer]?.hand;
  return hand?.map((id) => tiles[id]);
};

const getIsMyTurn = ({ myPlayer, playerTurnsOrder }: EngineState) =>
  myPlayer === playerTurnsOrder[0];

const Hand = () => {
  const hand = useEngine(getHand);
  const myName = useEngine(useCallback(({ myPlayer }) => myPlayer, []));
  const isMyTurn = useEngine(getIsMyTurn);
  const selectedTile = useEngine(
    useCallback((state) => state.selectedTile, [])
  );
  const selectTile = useEngine(useCallback((state) => state.selectTile, []));
  const playTile = useEngine(useCallback((state) => state.playTile, []));

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

  return (
    <div className={styles.hand}>
      <button
        type="button"
        onClick={onPlayClick}
        disabled={!(selectedTile && isMyTurn)}
      >
        Play selected tile
      </button>
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
    </div>
  );
};

export default memo(Hand);
