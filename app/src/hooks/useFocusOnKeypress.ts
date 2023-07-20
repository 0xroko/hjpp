import { useCallback, useEffect } from "react";

export const useFocusOnKeypress = (
  ref: React.RefObject<HTMLElement>,
  key: string,
  ctrlOrMeta: boolean = false
) => {
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === key &&
        (e.ctrlKey === ctrlOrMeta || e.metaKey === ctrlOrMeta) &&
        document.activeElement !== ref.current
      ) {
        ref.current?.focus();
        e.preventDefault();
      }
    },
    [ref, key, ctrlOrMeta]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [ref, handleKeydown]);
};
