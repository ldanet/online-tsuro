import { memo, ReactNode, useCallback } from "react";
import {
  getIsHost,
  getPhase,
  getPlayersArray,
  getTurnOrder,
  getWinners,
  getRemovePlayer,
  getMyPlayer,
  getPlayers,
} from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import { Player } from "../../engine/types";
import { formatListHumanReadable } from "../../utils/strings";
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

const playerDecoration = {
  red: "decoration-red-dark",
  blue: "decoration-blue-dark",
  green: "decoration-green-dark",
  yellow: "decoration-yellow-dark",
  orange: "decoration-orange-dark",
  purple: "decoration-purple-dark",
  cyan: "decoration-cyan-dark",
  pink: "decoration-pink-dark",
  black: "decoration-black-dark",
  white: "decoration-white-dark",
} as const;

type GameStatusPlayerProps = {
  player: Player;
  displayNameOverride?: string;
  handleRemovePlayer?: (name: string) => void;
};

export const GameStatusPlayer = ({
  player: { name, status, color, disconnected },
  displayNameOverride,
  handleRemovePlayer,
}: GameStatusPlayerProps) => {
  const winners = useEngine(getWinners);
  const turnOrder = useEngine(getTurnOrder);
  const gamePhase = useEngine(getPhase);
  const tokenProps =
    gamePhase !== "joining" && status === "watching"
      ? {
          children: <span>👀 </span>,
          className: "border-none bg-none p-0 text-base leading-4 w-5",
        }
      : {
          className: cn(
            "h-5 w-5 rounded-full border-2 flex-shrink-0",
            color
              ? "border-solid drop-shadow-[0.05rem_0.05rem_0.05rem_rgba(0,0,0,0.2)]"
              : "border-dashed bg-none",
            color && playerBg[color],
            color ? playerBorder[color] : "border-orange-800"
          ),
        };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xl",
        color && playerDecoration[color],
        turnOrder[0] === name && "underline decoration-4 underline-offset-4",
        disconnected && "opacity-50"
      )}
    >
      {handleRemovePlayer ? (
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
      <span>
        {winners.includes(name) && <>🏆</>}
        {status === "dead" && <>💩</>} {displayNameOverride || name}
      </span>
    </div>
  );
};

const GameStatus = () => {
  const players = useEngine(getPlayers);
  const myPlayer = useEngine(getMyPlayer);
  const turnOrder = useEngine(getTurnOrder);
  const winners = useEngine(getWinners);
  const gamePhase = useEngine(getPhase);

  let message: ReactNode = "";
  if (gamePhase === "finished") {
    if (winners.length > 1) {
      if (winners.includes(myPlayer)) {
        const otherWinners = winners.filter((name) => name !== myPlayer);
        message = <>🏆 You tie with {formatListHumanReadable(otherWinners)}!</>;
      } else {
        message = <>{formatListHumanReadable(winners)} tie!</>;
      }
    } else {
      message =
        winners[0] === myPlayer ? (
          <>
            <GameStatusPlayer
              player={players[myPlayer]}
              displayNameOverride="You"
            />
            <span className="ml-2"> win!</span>
          </>
        ) : (
          <>
            <GameStatusPlayer player={players[winners[0]]} />
            <span className="ml-2"> wins!</span>
          </>
        );
    }
  } else {
    const currentPlayer = players[turnOrder[0]];

    message =
      currentPlayer &&
      (myPlayer === currentPlayer.name ? (
        <>
          <GameStatusPlayer
            player={currentPlayer}
            displayNameOverride="Your "
          />
          <span>&nbsp;turn</span>
        </>
      ) : (
        <>
          <GameStatusPlayer player={currentPlayer} />
          <span>&apos;s turn</span>
        </>
      ));
  }
  return (
    <>
      <p className="flex flex-1 items-center justify-center align-baseline text-xl">
        {message}
      </p>
    </>
  );
};

export default memo(GameStatus);
