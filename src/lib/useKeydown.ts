import { useCallback, useEffect, type DependencyList } from "react";

interface Options {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export default function useKeydown(
  { key, ctrlKey = false, altKey = false, metaKey = false }: Options,
  callback: (e: KeyboardEvent) => void,
  deps: DependencyList,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handler = useCallback(callback, deps);

  useEffect(() => {
    const controller = new AbortController();
    document.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (
          e.key === key &&
          e.ctrlKey === ctrlKey &&
          e.altKey === altKey &&
          e.metaKey === metaKey
        ) {
          handler(e);
        }
      },
      controller,
    );
    return () => controller.abort();
  }, [handler, key, ctrlKey, altKey, metaKey]);
}
