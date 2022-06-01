import { memo, useCallback, useEffect, useState } from "react";
import { getHostId } from "../../engine/selectors";
import { useEngine } from "../../engine/store";
import styles from "./ShareUrl.module.css";

const getGameURL = (gameID: string) =>
  `${document.location.origin}/?gameId=${gameID}`;

const ShareUrl = () => {
  const gameID = useEngine(getHostId);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<boolean | null>(null);
  // const [copyGameIDSuccess, setCopyGameIDSuccess] = useState<boolean | null>(
  //   null
  // );

  const handleCopyLink = useCallback(() => {
    if (gameID)
      navigator.clipboard
        .writeText(getGameURL(gameID))
        .then(() => {
          setCopyLinkSuccess(true);
        })
        .catch(() => {
          setCopyLinkSuccess(false);
        });
  }, [gameID]);

  // const handleCopyGameID = useCallback(() => {
  //   if (gameID)
  //     navigator.clipboard
  //       .writeText(getGameURL(gameID))
  //       .then(() => {
  //         setCopyGameIDSuccess(true);
  //       })
  //       .catch(() => {
  //         setCopyGameIDSuccess(false);
  //       });
  // }, [gameID]);

  useEffect(() => {
    if (copyLinkSuccess !== null) {
      const timeoutID = setTimeout(() => setCopyLinkSuccess(null), 3000);
      return () => {
        clearTimeout(timeoutID);
      };
    }
  }, [copyLinkSuccess]);
  // useEffect(() => {
  //   if (copyGameIDSuccess !== null) {
  //     const timeoutID = setTimeout(() => setCopyGameIDSuccess(null), 3000);
  //     return () => {
  //       clearTimeout(timeoutID);
  //     };
  //   }
  // }, [copyGameIDSuccess]);

  return gameID ? (
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
          value={getGameURL(gameID)}
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

      {/* <p>
        <button type="button" onClick={handleCopyGameID}>
          {copyGameIDSuccess ? (
            <>✔️ Copied to clipboard</>
          ) : copyGameIDSuccess === false ? (
            <>Failed to copy game ID</>
          ) : (
            <>Copy game ID to clipboard</>
          )}
        </button>
      </p> */}
    </div>
  ) : null;
};

export default memo(ShareUrl);
