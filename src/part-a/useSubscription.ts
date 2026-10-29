import { useCallback, useEffect, useReducer, useRef } from "react";
import { getSubscription, skipNextShipment } from "../api/mockApi";
import { ApiError } from "../api/types";
import { initialState, reducer } from "./subscriptionReducer";

export function useSubscription() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Ids of loads: only the latest one may write to state. This ignores the first (discarded) run of the
  // effect under StrictMode and any slower, older response after "Try again" or a refresh.
  const latestLoad = useRef(0);
  // Synchronous guard against a double click: dispatch is async, so the reducer alone cannot stop two calls.
  const skipInFlight = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(async (mode: "initial" | "refresh") => {
    const id = ++latestLoad.current;
    dispatch({ type: mode === "initial" ? "LOAD_START" : "REFRESH_START" });
    try {
      const data = await getSubscription();
      if (id !== latestLoad.current) return;
      dispatch({ type: mode === "initial" ? "LOAD_OK" : "REFRESH_OK", data });
    } catch (error) {
      if (id !== latestLoad.current) return;
      if (mode === "refresh") dispatch({ type: "REFRESH_FAIL" });
      else dispatch({ type: "LOAD_FAIL", reason: error instanceof ApiError && error.status === 404 ? "notFound" : "failed" });
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load("initial");
    return () => {
      mounted.current = false;
      latestLoad.current++;
    };
  }, [load]);

  const confirmSkip = useCallback(async () => {
    const subscription = state.data;
    if (!subscription || skipInFlight.current) return;
    if (state.skip !== "confirming" && state.skip !== "submitError") return;

    skipInFlight.current = true;
    dispatch({ type: "SKIP_SUBMIT" });
    try {
      const updated = await skipNextShipment({
        subscriptionId: subscription.id,
        expectedUpdatedAt: subscription.updatedAt,
      });
      if (mounted.current) dispatch({ type: "SKIP_OK", data: updated });
    } catch (error) {
      if (!mounted.current) return;
      const status = error instanceof ApiError ? error.status : null;
      if (status === 409 || status === 400) {
        // The subscription is not what the customer confirmed against. Reload and let them decide again.
        // The skip is never retried automatically.
        dispatch({ type: "SKIP_REJECTED", notice: status === 409 ? "conflict" : "notActive" });
        void load("refresh");
      } else if (status === 404) {
        dispatch({ type: "SKIP_NOT_FOUND" });
      } else {
        dispatch({ type: "SKIP_FAIL" });
      }
    } finally {
      skipInFlight.current = false;
    }
  }, [state.data, state.skip, load]);

  return {
    state,
    retryLoad: useCallback(() => void load("initial"), [load]),
    retryRefresh: useCallback(() => void load("refresh"), [load]),
    openSkip: useCallback(() => dispatch({ type: "SKIP_OPEN" }), []),
    cancelSkip: useCallback(() => dispatch({ type: "SKIP_CANCEL" }), []),
    confirmSkip,
  };
}
