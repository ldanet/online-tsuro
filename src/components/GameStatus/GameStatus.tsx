import { memo, useCallback } from "react";
import {
  getIsHost,
  getPhase,
  getPlayersArray,
  getTurnOrder,
  getWinners,
  getRemovePlayer,
  getMyPlayer,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { cn } from "../../utils/styles";

const playerBg = {
  red: "bg-red",
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  orange: "bg-orange",
  purple: "bg-purple",
  cyan: "bg-cyan",
  pink: "bg-pink",
  black: "bg-black",
  white: "bg-white",
} as const;

const playerBorder = {
  red: "border-red-dark",
  blue: "border-blue-dark",
  green: "border-green-dark",
  yellow: "border-yellow-dark",
  orange: "border-orange-dark",
  purple: "border-purple-dark",
  cyan: "border-cyan-dark",
  pink: "border-pink-dark",
  black: "border-black-dark",
  white: "border-white-dark",
} as const;

const GameStatus = () => {
  const players = useEngine(getPlayersArray);
  const winners = useEngine(getWinners);
  const turnOrder = useEngine(getTurnOrder);
  const isHost = useEngine(getIsHost);
  const removePlayer = useEngine(getRemovePlayer);
  const gamePhase = useEngine(getPhase);
  const myPlayer = useEngine(getMyPlayer);

  const handleRemovePlayer = useCallback(
    (name: string) => {
      if (confirm(`Remove ${name} from the game and disconnect them?`))
        removePlayer(name);
    },
    [removePlayer]
  );
  const foo = <div className="border-none bg-none p-0 text-base" />;
  return (
    <>
      <div className="flex gap-4 ">
        {players.map(({ name, status, color, disconnected }) => {
          const tokenProps =
            gamePhase !== "joining" && status === "watching"
              ? {
                  children: <span>👀 </span>,
                  className: "border-none bg-none p-0 text-base leading-4 w-5",
                }
              : {
                  className: cn(
                    "h-5 w-5 rounded-full border-2",
                    color ? "border-solid" : "border-dashed bg-none",
                    color && playerBg[color],
                    color && playerBorder[color]
                  ),
                };

          return (
            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border-2 border-solid p-2 text-base",
                color && playerBorder[color],
                turnOrder[0] === name && "border-4",
                disconnected && "opacity-50"
              )}
              key={name}
            >
              {isHost && name !== myPlayer ? (
                <button
                  {...tokenProps}
                  className={cn(
                    "relative cursor-pointer rounded-full hover:border-2 hover:border-solid hover:border-red-dark hover:bg-none hover:after:absolute hover:after:left-0 hover:after:top-0 hover:after:h-full hover:after:w-full hover:after:text-sm hover:after:leading-4 hover:after:content-['❌']",
                    tokenProps.className
                  )}
                  onClick={handleRemovePlayer.bind(null, name)}
                  title="Remove player"
                  aria-label="Remove player"
                />
              ) : (
                <div {...tokenProps} />
              )}
              {name} {winners.includes(name) && <>🏆</>}{" "}
              {status === "dead" && <>💩</>}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default memo(GameStatus);
