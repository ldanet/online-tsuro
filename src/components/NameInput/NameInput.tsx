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
      <label className="block text-xl" htmlFor="player-name">
        Choose a nickname:
      </label>
      <input
        className="mr-2 block h-8 w-full text-2xl"
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
        <p className="text-sm text-red-dark" id="name-error">
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
