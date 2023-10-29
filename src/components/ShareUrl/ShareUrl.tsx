import { memo, useCallback, useEffect, useState } from "react";
import { getHostId, getHostName } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import Button from "../Button";

const getGameURL = (gameID: string, name: string) =>
  `${document.location.origin}/game?gameId=${gameID}&name=${name}`;

const ShareUrl = () => {
  const gameID = useEngine(getHostId);
  const name = useEngine(getHostName);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<boolean | null>(null);

  const handleCopyLink = useCallback(async () => {
    if (gameID && name)
      try {
        await navigator.clipboard.writeText(getGameURL(gameID, name));
        setCopyLinkSuccess(true);
      } catch {
        setCopyLinkSuccess(false);
      }
  }, [gameID, name]);

  useEffect(() => {
    if (copyLinkSuccess !== null) {
      const timeoutID = setTimeout(() => setCopyLinkSuccess(null), 6000);
      return () => {
        clearTimeout(timeoutID);
      };
    }
  }, [copyLinkSuccess]);

  useEffect(() => {
    if (gameID && name) {
      window.history.replaceState(null, "", getGameURL(gameID, name));
    }
  }, [gameID, name]);

  if (!gameID) {
    return (
      <div className="flex-grow-0 text-xs">
        <p className="m-0 max-w-sm">
          Playing offline.
          <br />
          Reload the page to get a shareable link to invite other players.
        </p>
      </div>
    );
  }

  return gameID && name ? (
    <div>
      <button
        type="button"
        onClick={handleCopyLink}
        className="-ml-2 w-full rounded-lg p-2 underline underline-offset-4 hover:bg-orange-800 hover:text-orange-50 hover:no-underline"
      >
        + Invite players
      </button>
      {copyLinkSuccess && (
        <p role="log" aria-live="polite" className="text-center">
          📋 Link copied to clipboard!
        </p>
      )}
    </div>
  ) : null;
};

export default memo(ShareUrl);
