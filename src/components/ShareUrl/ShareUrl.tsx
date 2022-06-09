import { memo, useCallback, useEffect, useState } from "react";
import { getHostId, getHostName } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import styles from "./ShareUrl.module.css";

const getGameURL = (gameID: string, name: string) =>
  `${document.location.origin}/game?gameId=${gameID}&name=${name}`;

const ShareUrl = () => {
  const gameID = useEngine(getHostId);
  const name = useEngine(getHostName);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<boolean | null>(null);

  const handleCopyLink = useCallback(() => {
    if (gameID && name)
      navigator.clipboard
        .writeText(getGameURL(gameID, name))
        .then(() => {
          setCopyLinkSuccess(true);
        })
        .catch(() => {
          setCopyLinkSuccess(false);
        });
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

  return gameID && name ? (
    <div className={styles.share_container}>
      <p>
        <label htmlFor="shareable-link">
          Invite players to join by sending them this link:
        </label>
      </p>
      <p>
        <input
          id="shareable-link"
          type="text"
          readOnly
          value={getGameURL(gameID, name)}
        />
        <button type="button" onClick={handleCopyLink}>
          {copyLinkSuccess ? (
            <>✔️ Copied to clipboard</>
          ) : copyLinkSuccess === false ? (
            <>Failed to copy link</>
          ) : (
            <>Copy link to clipboard</>
          )}
        </button>
      </p>
    </div>
  ) : null;
};

export default memo(ShareUrl);
