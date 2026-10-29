import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";

/**
 * Whether an element is at least `minWidth` px wide, or null until it has been measured.
 *
 * The first measurement happens in useLayoutEffect, so it lands before the browser paints: callers render what
 * depends on the answer only once it is not null, and no frame ever shows the wrong layout. After that a
 * ResizeObserver follows the element. Its changes are committed with flushSync so the DOM order (decided here)
 * never lags the CSS container query (decided by the browser) by a frame. flushSync is not allowed while React is
 * already rendering, which is why the first measurement uses a plain setState: inside useLayoutEffect React
 * flushes it synchronously before paint anyway.
 *
 * It measures the content box (clientWidth: no padding or border), which is what an @container query sees, so the
 * element must have no padding of its own. Keep `minWidth` equal to the @container threshold in the stylesheet.
 */
export function useContainerAtLeast(ref: RefObject<HTMLElement | null>, minWidth: number): boolean | null {
  const [atLeast, setAtLeast] = useState<boolean | null>(null);
  const last = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const initial = element.clientWidth >= minWidth;
    last.current = initial;
    setAtLeast(initial);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentBoxSize?.[0]?.inlineSize ?? element.clientWidth;
      const next = width >= minWidth;
      if (last.current === next) return;
      last.current = next;
      flushSync(() => setAtLeast(next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, minWidth]);

  return atLeast;
}
