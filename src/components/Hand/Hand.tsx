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

const Hand = () => {
  const hand = useEngine(getHand);
  const me = useEngine(useCallback(({ myPlayer }) => myPlayer, []));
  const isMyTurn = useEngine(
    useCallback(({ myPlayer, playerTurn }) => myPlayer === playerTurn, [])
  );
  const selectedTile = useEngine(
    useCallback((state) => state.selectedTile, [])
  );
  const selectTile = useEngine(useCallback((state) => state.selectTile, []));
  const playTile = useEngine(useCallback((state) => state.playTile, []));

  const [rotations, setRotations] = useState<number[]>([]);

  const onTileClick = useCallback(
    (index: number, { id, combinations }: TileType) => {
      selectTile &&
        selectTile({
          id: id,
          combination:
            combinations[(rotations[index] ?? 0) % combinations.length],
        });
      if (selectedTile?.id === id) {
        const newRotations = [...rotations];
        newRotations[index] =
          ((rotations[index] ?? 0) + 1) % combinations.length;
        setRotations(newRotations);
      }
    },
    [selectTile, rotations, selectedTile]
  );

  const onPlayClick = useCallback(() => {
    playTile && selectedTile && playTile(me, selectedTile);
  }, [me, playTile, selectedTile]);

  return (
    <div>
      {hand?.map((tile, i) => (
        <button
          key={tile.id}
          className={styles.tileButton}
          type="button"
          onClick={onTileClick.bind(null, i, tile)}
        >
          <svg
            className={styles.tileSvg}
            viewBox="-0.5 -0.5 30.5 30.5"
            height={31}
            width={31}
          >
            <Tile
              combination={
                tile.combinations[
                  (rotations[i] ?? 0) % tile.combinations.length
                ]
              }
            />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={onPlayClick}
        disabled={!(selectedTile && isMyTurn)}
      >
        Play
      </button>
    </div>
  );
};

export default memo(Hand);
