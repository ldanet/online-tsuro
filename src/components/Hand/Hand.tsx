import { AnimatePresence, motion } from "framer-motion";
import { memo, useCallback, useState } from "react";
import { TileType, tiles } from "../../constants/tiles";
import {
  getIsLoading,
  getIsMyTurn,
  getMyPlayer,
  getMyPlayerData,
  getPhase,
  getPlayTile,
  getSelectedTile,
  getSetSelectedTile,
  getTurnOrder,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";
import Tile from "../Tile/Tile";

export const getHand = ({ players, myPlayer }: EngineState) => {
  const hand = players[myPlayer]?.hand;
  return hand?.map((id) => tiles[id]);
};

const Hand = () => {
  const hand = useEngine(getHand);
  const myName = useEngine(getMyPlayer);
  const myData = useEngine(getMyPlayerData);
  const isMyTurn = useEngine(getIsMyTurn);
  const selectedTile = useEngine(getSelectedTile);
  const isLoading = useEngine(getIsLoading);
  const turns = useEngine(getTurnOrder);
  const gamePhase = useEngine(getPhase);

  const setSelectedTile = useEngine(getSetSelectedTile);
  const playTile = useEngine(getPlayTile);

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
      setSelectedTile &&
        setSelectedTile({
          id,
          combination: combinations[combinationIndex],
        });
    },
    [setSelectedTile, rotations, selectedTile]
  );

  const onPlayClick = useCallback(() => {
    playTile && selectedTile && playTile(myName, selectedTile);
  }, [myName, playTile, selectedTile]);

  if (isLoading) {
    return <p>Connecting...</p>;
  }

  return (
    <div className="flex max-w-full flex-col items-center justify-center">
      <div className="flex w-[calc(var(--tile-size)*5*1.33)] self-start pl-[calc(var(--tile-size)*1.33)]">
        <AnimatePresence initial={false}>
          {hand?.map((tile, i) =>
            tile ? (
              <motion.button
                key={tile.id}
                layout
                type="button"
                onClick={
                  gamePhase === "main"
                    ? onTileClick.bind(null, i, tile)
                    : undefined
                }
                title="Click to select, click again to rotate"
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { duration: 1 },
                }}
                exit={{
                  y: -50,
                  opacity: 0,
                  transition: { duration: 0.5, type: "spring" },
                }}
              >
                <svg
                  className="h-[calc(var(--tile-size)*1.33)]"
                  viewBox="0 0 40 40"
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                >
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
              </motion.button>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {isMyTurn ? (
        gamePhase === "round1" ? (
          <p className="mb-1 ml-0 mr-0 mt-0 text-center">
            It&apos;s your turn! Pick a notch on the edge of the board
          </p>
        ) : selectedTile ? (
          <button
            type="button"
            onClick={onPlayClick}
            disabled={!(selectedTile && isMyTurn)}
          >
            Play selected tile
          </button>
        ) : (
          <p className="mb-1 ml-0 mr-0 mt-0 text-center">
            It&apos;s your turn! Select a tile to play
          </p>
        )
      ) : (
        <p className="m-0 text-xs">{turns[0]}&apos;s turn</p>
      )}

      {myData.status === "playing" && gamePhase === "main" && (
        <p className="m-0 text-xs">
          Click on a tile to select it and click again to rotate
        </p>
      )}
    </div>
  );
};

export default memo(Hand);
