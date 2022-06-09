import { useCallback, useEffect, useRef, useState } from "react";

export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted;
};

export const useNameInput = () => {
  const nameInput = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState<string>();

  const validateName = useCallback(() => {
    if (!nameInput.current?.value) {
      setNameError("Please enter your a nickname to start playing.");
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
