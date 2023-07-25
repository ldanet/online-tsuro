import { memo, useCallback, useEffect, useState } from "react";
import { getHostId, getHostName, getIsOffline } from "../../engine/selectors";
import { useEngine } from "../../engine/store";

const getGameURL = (gameID: string, name: string) =>
  `${document.location.origin}/game?gameId=${gameID}&name=${name}`;

const ShareUrl = () => {
  const gameID = useEngine(getHostId);
  const isOffline = useEngine(getIsOffline);
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
      const timeoutID = setTimeout(() => setCopyLinkSuccess(null), 3000);
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

  if (isOffline && !gameID) {
    return (
      <div className="flex-grow-0 basis-[3] border-2 border-solid border-gray-500 p-2 text-xs">
        <p className="m-0 max-w-sm">
          Playing offline.
          <br />
          Reload the page to get a shareable link to invite other players.
        </p>
      </div>
    );
  }

  return gameID && name ? (
    <div className="flex-grow-0 basis-[3] border-l-2 border-solid border-gray-500 p-2 text-xs">
      <p className="m-0 max-w-sm">
        <label htmlFor="shareable-link">Share the URL to invite players</label>
      </p>
      <p className="m-0 max-w-sm">
        <button type="button" onClick={handleCopyLink}>
          {copyLinkSuccess ? (
            <>✔️ Copied to clipboard</>
          ) : copyLinkSuccess === false ? (
            <>Failed to copy URL</>
          ) : (
            <>Copy to clipboard</>
          )}
        </button>
      </p>
    </div>
  ) : null;
};

export default memo(ShareUrl);
