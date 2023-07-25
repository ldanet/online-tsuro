import { memo, useCallback, useEffect, useState } from "react";
import { getHostId, getHostName, getIsOffline } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import styles from "./ShareUrl.module.css";

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
      <div className={styles.share_container}>
        <p>
          Playing offline.
          <br />
          Reload the page to get a shareable link to invite other players.
        </p>
      </div>
    );
  }

  return gameID && name ? (
    <div className={styles.share_container}>
      <p>
        <label htmlFor="shareable-link">Share the URL to invite players</label>
      </p>
      <p>
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
