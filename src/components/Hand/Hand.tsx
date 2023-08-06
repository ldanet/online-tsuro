import { AnimatePresence, motion } from "framer-motion";
import { memo, useCallback, useState } from "react";
import { TileType, tiles } from "../../constants/tiles";
import {
  getIsLoading,
  getIsMyTurn,
  getMyPlayer,
  getMyPlayerData,
  getPhase,
  getPlaySelectedTile,
  getSelectedTile,
  getSetSelectedTile,
  getTurnOrder,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { EngineState } from "../../engine/types";
import Button from "../Button";
import Tile from "../Tile/Tile";

export const getHand = ({ players, myPlayer }: EngineState) => {
  const hand = players[myPlayer]?.hand;
  return hand?.map((id) => tiles[id]);
};

const Hand = () => {
  const hand = useEngine(getHand);
  const myData = useEngine(getMyPlayerData);
  const isMyTurn = useEngine(getIsMyTurn);
  const selectedTile = useEngine(getSelectedTile);
  const isLoading = useEngine(getIsLoading);
  const turns = useEngine(getTurnOrder);
  const gamePhase = useEngine(getPhase);

  const setSelectedTile = useEngine(getSetSelectedTile);
  const playTile = useEngine(getPlaySelectedTile);

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

  if (isLoading) {
    return <p>Connecting...</p>;
  }

  return (
    <div className="flex max-w-full flex-col items-center justify-center">
      {myData.status === "playing" && gamePhase === "main" && (
        <p className="m-0 text-xs">
          Click on a tile to select it and click again to rotate
        </p>
      )}

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
                  {selectedTile?.id === tile.id && (
                    <>
                      <circle
                        className="fill-orange-800 stroke-none"
                        cx="33"
                        cy="7"
                        r="5.5"
                        filter="url(#tile-shadow)"
                      />
                      <path
                        className="fill-orange-50 stroke-none"
                        d="m 36.677443,7.7654419 c 0,1.600138 -1.198577,2.7439571 -2.731792,2.7439571 h -0.413722 v 0.559746 c 0,0.444151 -0.413723,0.596255 -0.75444,0.334637 l -1.490624,-1.156001 c -0.206855,-0.164265 -0.212948,-0.4623931 0,-0.6266651 l 1.490624,-1.14991 c 0.334636,-0.255535 0.75444,-0.10343 0.75444,0.322462 v 0.632754 h 0.444151 c 0.90045,0 1.56363,-0.705764 1.56363,-1.66098 v -0.949129 c 0,-0.316381 0.255538,-0.571919 0.571907,-0.571919 0.310301,0 0.565826,0.255538 0.565826,0.571919 z"
                      />
                      <path
                        className="fill-orange-50 stroke-none"
                        d="m 29.322557,6.234952 c 0,-1.600138 1.198577,-2.743957 2.731792,-2.743957 h 0.413722 V 2.931249 c 0,-0.444151 0.413723,-0.596255 0.75444,-0.334637 l 1.490624,1.156001 c 0.206855,0.164265 0.212948,0.462393 0,0.626665 l -1.490624,1.14991 c -0.334636,0.255535 -0.75444,0.10343 -0.75444,-0.322462 V 4.573972 H 32.02392 c -0.90045,0 -1.56363,0.705764 -1.56363,1.66098 v 0.949129 c 0,0.316381 -0.255538,0.571919 -0.571907,0.571919 -0.310301,0 -0.565826,-0.255538 -0.565826,-0.571919 z"
                      />
                    </>
                  )}
                </svg>
              </motion.button>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {isMyTurn ? (
        gamePhase === "main" &&
        (selectedTile ? (
          <Button
            type="button"
            onClick={playTile}
            disabled={!(selectedTile && isMyTurn)}
          >
            Play selected tile
          </Button>
        ) : (
          <p className="mb-1 ml-0 mr-0 mt-0 text-center">
            It&apos;s your turn! Select a tile to play
          </p>
        ))
      ) : (
        <p className="m-0 text-xs">{turns[0]}&apos;s turn</p>
      )}
    </div>
  );
};

export default memo(Hand);
