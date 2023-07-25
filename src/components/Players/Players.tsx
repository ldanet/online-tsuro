import { motion } from "framer-motion";
import { Variants } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { notchCoordinates } from "../../constants/tiles";
import { getColoredPaths, getPlayers } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import {
  ColoredPath,
  Coordinate,
  PlayerColor,
  Players,
} from "../../engine/types";
import {
  getNextTileCoordinate,
  getPlayerCoordinates,
} from "../../engine/utils";
import { getTranslate, getTranslateValue } from "../../utils/math";
import { getPath, notchToTransform } from "../../utils/tiles";

const ANIMATION_DURATION = 0.3;

const coloredLineAnimationVariants: Variants = {
  hidden: { pathLength: 0 },
  show: { pathLength: 1 },
};

const strokeColors = {
  red: "stroke-red",
  blue: "stroke-blue",
  green: "stroke-green",
  yellow: "stroke-yellow",
  orange: "stroke-orange",
  purple: "stroke-purple",
  cyan: "stroke-cyan",
  pink: "stroke-pink",
  black: "stroke-black",
  white: "stroke-white",
} as const;

const playerStyles = {
  red: "fill-red stroke-red-dark",
  blue: "fill-blue stroke-blue-dark",
  green: "fill-green stroke-green-dark",
  yellow: "fill-yellow stroke-yellow-dark",
  orange: "fill-orange stroke-orange-dark",
  purple: "fill-purple stroke-purple-dark",
  cyan: "fill-cyan stroke-cyan-dark",
  pink: "fill-pink stroke-pink-dark",
  black: "fill-black stroke-black-dark",
  white: "fill-white stroke-white-dark",
} as const;

const ColoredLine = ({ pair, color, row, col }: ColoredPath) => {
  return (
    <>
      <motion.path
        key={`path-${color}-${pair}-${col}-${row}-shadow`}
        className="stroke-3 stroke-tile-line fill-none"
        d={getPath(pair)}
        transform={getTranslate(row, col)}
        variants={coloredLineAnimationVariants}
        transition={{ duration: ANIMATION_DURATION, ease: "linear" }}
        initial="hidden"
        animate="show"
      />
      <motion.path
        key={`path-${color}-${pair}-${col}-${row}-color`}
        className={`stroke-2 ${strokeColors[color]} fill-none`}
        d={getPath(pair)}
        transform={getTranslate(row, col)}
        variants={coloredLineAnimationVariants}
        transition={{ duration: ANIMATION_DURATION }}
        initial="hidden"
        animate="show"
      />
    </>
  );
};

type ColorCoordinates = Coordinate & { isOut: boolean };

type ColorCoordinatesData = {
  colorCoordinates: {
    [key in PlayerColor]?: ColorCoordinates;
  };
  collisions: Array<Coordinate & { colors: [PlayerColor, PlayerColor] }>;
  outs: Array<Coordinate & { color: PlayerColor }>;
};

export const getColorCoordinatesData = (
  players: Players,
  paths: ColoredPath[]
): ColorCoordinatesData => {
  return Object.values(players).reduce<ColorCoordinatesData>(
    ({ colorCoordinates, collisions, outs }, player) => {
      const playerCoords = getPlayerCoordinates(player, paths);

      if (player.color && playerCoords) {
        // find collision
        const next = getNextTileCoordinate(playerCoords);
        const newCollisions = [...collisions];
        const newOuts = [...outs];
        const [collisionColor] =
          (Object.entries(colorCoordinates).find(
            ([_, c]) =>
              c.row === next.row && c.col === next.col && c.notch === next.notch
          ) as [PlayerColor, Coordinate]) || [];
        if (collisionColor)
          newCollisions.push({
            ...playerCoords,
            colors: [collisionColor, player.color],
          });

        const isOut =
          next.row < 0 || next.row >= 6 || next.col < 0 || next.col >= 6;

        if (isOut) {
          newOuts.push({
            ...playerCoords,
            color: player.color,
          });
        }
        return {
          colorCoordinates: {
            ...colorCoordinates,
            [player.color]: { ...playerCoords, isOut },
          },
          collisions: newCollisions,
          outs: newOuts,
        };
      }

      return { colorCoordinates, collisions, outs };
    },
    { colorCoordinates: {}, collisions: [], outs: [] }
  );
};

const Players = () => {
  const players = useEngine(getPlayers);
  const coloredPaths = useEngine(getColoredPaths);

  const isAnimating = useRef(false);
  const [existingPaths, setExistingPaths] = useState(coloredPaths);
  const [movingColor, setMovingColor] = useState<PlayerColor>();

  useEffect(() => {
    if (coloredPaths.length > existingPaths.length) {
      const newPaths = coloredPaths.slice(0, existingPaths.length + 1);
      if (isAnimating.current) {
        setTimeout(() => {
          setExistingPaths(newPaths);
          setMovingColor(newPaths[existingPaths.length].color);
        }, ANIMATION_DURATION * 1000);
      } else {
        setExistingPaths(newPaths);
        setMovingColor(newPaths[existingPaths.length].color);
        isAnimating.current = true;
      }
    } else {
      isAnimating.current = false;
      setTimeout(() => {
        setMovingColor(undefined);
      }, ANIMATION_DURATION * 1000);
      setExistingPaths(coloredPaths);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coloredPaths, existingPaths]);

  const { colorCoordinates, collisions, outs } = getColorCoordinatesData(
    players,
    existingPaths
  );

  return (
    <>
      <defs>
        <filter id="player-shadow" colorInterpolationFilters="sRGB">
          <feDropShadow
            dx="0.5"
            dy="0.5"
            stdDeviation=".5"
            floodOpacity="0.4"
          />
        </filter>
      </defs>
      <g>
        {existingPaths.map((p) => (
          <ColoredLine
            key={`path-${p.color}-${p.pair}-${p.col}-${p.row}`}
            {...p}
          />
        ))}
      </g>
      <g filter="url(#player-shadow)">
        {/* Workaround for the group to be the size of the board so the shadow doesn't get clipped */}
        <rect x={0} y={0} height={190} width={190} fill="none" stroke="none" />
        {(
          Object.entries(colorCoordinates) as [PlayerColor, ColorCoordinates][]
        ).map(([color, coords]) => {
          if (!coords || coords.isOut) return null;

          const collision = collisions.find((c) => c.colors.includes(color));
          return movingColor !== color &&
            // Display player's token while colliding color is still moving
            (!collision ||
              (movingColor && collision.colors.includes(movingColor))) ? (
            <circle
              className={`stroke-[0.75] ${playerStyles[color]}`}
              key={color}
              cx={
                getTranslateValue(coords.col) + notchCoordinates[coords.notch].x
              }
              cy={
                getTranslateValue(coords.row) + notchCoordinates[coords.notch].y
              }
              r="3"
            />
          ) : null;
        })}
      </g>
      <g>
        {outs.map((out) => {
          if (out.color === movingColor) return null;
          // spill is tile shaped with the spill at notch 0
          const translate = getTranslate(out.row, out.col);
          const notchTransform = notchToTransform[out.notch];
          const transform = `${translate}  rotate(${-notchTransform.rotation} 15 15) ${
            notchTransform.flip ? `scale(-1 1) translate(-30)` : ""
          }`;
          return (
            <path
              key={`spill-${out.color}`}
              className={`stroke-[0.3] ${playerStyles[out.color]}`}
              transform={transform}
              d="m 7.4675123,30.003181 c 0.018152,0.08646 0.041037,0.173305 0.069424,0.260079 0.5485081,1.188296 -1.529986,2.541602 -0.4952548,2.961117 0.8229011,0.333632 0.6164606,-2.251042 1.3077601,-1.829999 0.53982,0.328783 -1.2536995,2.773147 -0.035233,2.969525 1.1771107,0.189713 0.1838275,-2.277249 0.7292438,-2.304617 0.5624362,-0.02822 -0.07002,1.076611 0.6863277,0.9495 0.9951309,-0.16724 -0.4958464,-1.348037 0.018784,-1.575616 0.6942695,-0.307018 0.8907475,3.072518 1.8784425,2.664547 0.920583,-0.38025 -1.589593,-2.46844 -1.318972,-3.825069 0.01681,-0.08428 0.07719,-0.236999 0.07567,-0.269467"
            />
          );
        })}
      </g>
      <g>
        {collisions.map((c) => {
          // Don't display collision if it involves a color that's still moving
          if (movingColor && c.colors.includes(movingColor)) return null;

          // Collision svg is tile shaped with the splat at notch 0
          const translate = getTranslate(c.row, c.col);
          const notchTransform = notchToTransform[c.notch];
          const transform = `${translate}  rotate(${-notchTransform.rotation} 15 15) ${
            notchTransform.flip ? `scale(-1 1) translate(-30)` : ""
          }`;
          return (
            <g
              key={`splat-${c.colors[0]}-${c.colors[1]}`}
              transform={transform}
            >
              <path
                className={`stroke-[0.3] ${playerStyles[c.colors[1]]}`}
                d="m 3.7965236,28.295003 c 0.018791,0.352534 0.5484128,0.804167 1.2182977,0.853422 0.5122337,0.03623 0.9063348,0.09124 1.2509713,0.378235 0.161132,0.137474 0.1882466,0.242384 0.1587676,0.335371 0.1909903,0.283958 0.5727722,0.403109 0.9149639,0.337568 0.5750244,-0.110137 1.1257346,-0.445333 1.7254068,-0.345773 0.3296844,0.05473 0.4716892,0.457529 0.8202573,0.467792 0.2778748,0.0082 0.4725198,-0.217135 0.6881298,-0.357044 0.245271,-0.159153 0.594683,-0.300561 0.85702,-0.165059 0.04123,-0.07179 0.10654,-0.130373 0.181346,-0.159019 0.385524,-0.148536 0.535388,-0.121074 1.08296,-0.358368 0.382791,-0.161844 0.419821,-0.72425 -0.03919,-0.771408 -0.679708,-0.06839 -1.385996,0.598204 -1.325169,0.205723 0.07457,-0.514566 0.831295,-1.01677 0.585673,-1.321331 -0.127113,-0.159717 -0.0668,-0.338475 -0.08317,-0.512623 -0.03858,-0.349866 -0.462391,-0.387625 -0.7368,-0.184254 -0.351918,0.258125 -0.08619,0.228505 -0.644775,0.601199 -0.09081,0.05749 -0.170236,0.0488 -0.259038,-0.01892 -0.4600524,-0.349266 -0.6614986,0.357853 -1.1196198,0.07199 -0.048112,-0.03172 -0.094648,-0.06934 -0.1443368,-0.0952 -0.2233929,-0.128844 -0.514221,-0.09961 -0.6849137,0.06858 -0.050898,0.04929 -0.082148,0.07236 -0.1303897,0.323574 C 8.085459,27.799325 7.8861697,28.003933 7.6803846,27.879793 7.4104395,27.71336 7.4225937,27.502761 7.1417556,27.188794 7.0013375,27.03181 6.7204708,27.000801 6.5478095,27.199914 c -0.2192555,0.255833 0.00357,0.598392 0.2594386,0.723337 0.2500062,0.123378 0.4076126,0.404361 0.3597719,0.630528 -0.080769,0.349423 -0.513614,0.416178 -0.8180097,0.284559 -0.9484068,-0.404263 -1.4403685,-1.151989 -2.2266512,-0.915576 -0.2373962,0.07217 -0.3343819,0.211999 -0.3258432,0.372242 z m 3.9457981,-1.668109 c -3.144e-4,0.0746 0.02501,0.150552 0.0665,0.230785 0.1411418,0.295515 0.5692676,0.246372 0.6989577,-0.121416 0.1105576,-0.460938 -0.3793643,-0.698752 -0.6784988,-0.332207 -0.060889,0.07491 -0.086679,0.148244 -0.086954,0.222841 z"
              />
              <path
                className={`stroke-[0.3] ${playerStyles[c.colors[0]]}`}
                d="m 5.7756306,32.57028 c -0.041844,0.456243 0.7012534,0.50418 1.1117554,-0.167455 0.1907133,-0.313764 0.3124916,-0.557963 0.6084088,-0.724148 0.1338676,-0.07743 0.2825423,0.02521 0.3321892,0.14537 0.1505064,0.354609 -0.071427,0.408536 0.06883,0.942761 0.1750313,0.662987 0.8865419,0.494531 0.8680551,-0.18952 -0.00615,-0.259455 0.1908879,-0.690939 0.4501364,-0.225536 0.1388095,0.257164 0.4207974,0.49603 0.7006742,0.31927 0.2039393,-0.127876 0.1993253,-0.298898 0.2695183,-0.632281 0.387453,-0.08514 0.600851,0.669837 0.943155,0.918478 0.486664,0.343799 0.821573,-0.415693 0.347894,-0.9258 -0.115772,-0.131537 -0.33015,-0.270516 -0.532314,-0.62006 -0.154851,-0.267738 0.02914,-0.627343 0.390747,-0.568484 0.709819,0.120445 1.668847,1.238116 2.646082,1.040137 0.437542,-0.08434 0.286544,-0.954674 -0.950342,-1.197053 -0.257083,-0.04981 -1.24395,-0.263188 -1.518959,-0.481278 -0.150752,-0.119719 -0.151651,-0.282026 -0.08092,-0.405162 -0.262338,-0.135506 -0.61175,0.0059 -0.85702,0.16506 -0.215611,0.139908 -0.410254,0.365225 -0.688131,0.357044 -0.348568,-0.01028 -0.4905729,-0.413059 -0.8202574,-0.467793 -0.5996717,-0.09956 -1.1503819,0.23564 -1.7254067,0.345774 -0.3421921,0.06554 -0.7239743,-0.05362 -0.914964,-0.337569 -0.011747,0.03705 -0.031555,0.07236 -0.056884,0.106805 -0.243939,0.324697 -0.145129,0.778765 0.3008932,0.992233 0.5176189,0.251457 -0.4952964,0.748008 -0.8239,1.389646 -0.041272,0.08095 -0.063263,0.154391 -0.069236,0.219568 z m 1.9717481,1.152411 c -0.00156,0.244256 0.2439325,0.476231 0.5401085,0.500328 0.2457454,0.02163 0.5139161,-0.252525 0.4005537,-0.534332 -0.1700449,-0.422709 -0.7643657,-0.575221 -0.9242471,-0.07087 -0.010914,0.03482 -0.016189,0.06997 -0.01642,0.10487 z"
              />
            </g>
          );
        })}
      </g>
    </>
  );
};

export default memo(Players);
