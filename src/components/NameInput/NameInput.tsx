import { memo, RefObject, useCallback, useRef, useState } from "react";
import { getMyPlayer } from "../../engine/selectors";
import { useEngine } from "../../engine/store";

type NameInputProps = {
  nameInput: RefObject<HTMLInputElement>;
  nameError?: string;
  clearNameError: () => void;
};

const NameInput = ({
  nameInput,
  nameError,
  clearNameError,
}: NameInputProps) => {
  const myPlayer = useEngine(getMyPlayer);
  return (
    <>
      <label className="block font-bold" htmlFor="player-name">
        Choose a nickname
      </label>
      <input
        className="mt-1 w-full rounded-lg border-2 border-orange-800 bg-orange-300 p-2 placeholder-orange-700 focus:bg-orange-200"
        id="player-name"
        type="text"
        ref={nameInput}
        defaultValue={myPlayer ?? ""}
        maxLength={12}
        required
        aria-describedby={nameError ? "name-error" : undefined}
        placeholder="Enter your nickname"
        onChange={clearNameError}
      />
      {nameError && (
        <p className="my-2" id="name-error">
          {nameError}
        </p>
      )}
    </>
  );
};

export default memo(NameInput);

export const useNameInput = () => {
  const nameInput = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState<string>();

  const validateName = useCallback(() => {
    if (!nameInput.current?.value) {
      setNameError("Please enter your nickname to start playing.");
      nameInput.current?.focus();
      return false;
    } else if (nameInput.current.value.length > 12) {
      setNameError("Your nickname must be 12 characters or shorter");
      return false;
    }
    return true;
  }, []);

  const clearNameError = useCallback(() => {
    setNameError(undefined);
  }, []);
  return { nameInput, nameError, validateName, clearNameError };
};
