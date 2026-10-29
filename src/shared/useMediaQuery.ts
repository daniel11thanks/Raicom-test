import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a media query matches. useSyncExternalStore reads matchMedia synchronously during the first render,
 * so there is no frame with the wrong layout (a useState + useEffect version would render the mobile order first).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
