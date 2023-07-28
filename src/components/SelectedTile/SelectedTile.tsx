import { motion, useAnimation } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { getMyPlayerData, getSelectedTile } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import {
  getNextTileCoordinate,
  getPlayerCoordinates,
} from "../../engine/utils";
import { getTranslate } from "../../utils/math";
import Tile from "../Tile/Tile";

const SelectedTile = () => {
  const selectedTile = useEngine(getSelectedTile);
  const selectedTileCoord = useEngine(
    useCallback(({ players, myPlayer, coloredPaths }) => {
      const coords = getPlayerCoordinates(players[myPlayer], coloredPaths);
      return coords && getNextTileCoordinate(coords);
    }, [])
  );
  const isPlaying = useEngine(
    useCallback((state) => getMyPlayerData(state).status === "playing", [])
  );
  const localSelectedTile = useRef(selectedTile);
  const controls = useAnimation();
  useEffect(() => {
    if (selectedTile?.id === localSelectedTile.current?.id) {
      controls.start({
        rotate: ["-90deg", "-45deg", "0deg"],
        scale: [1, 1.2, 1],
        transition: { duration: 0.3, times: [0, 0.5, 1], ease: "easeOut" },
      });
    }
    localSelectedTile.current = selectedTile;
  }, [controls, selectedTile]);
  return (
    <>
      {isPlaying && selectedTile && selectedTileCoord && (
        <motion.g
          animate={controls}
          // Reset animation centre of rotation if the player gets moved with a tile selected already
          key={`${selectedTileCoord.col}-${selectedTileCoord.col}`}
        >
          <Tile
            combination={selectedTile.combination}
            transform={getTranslate(
              selectedTileCoord.row,
              selectedTileCoord.col
            )}
            opacity={0.5}
          />
        </motion.g>
      )}
    </>
  );
};

export default memo(SelectedTile);
