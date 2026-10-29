import type { Subscription } from "../api/types";

export type SkipPhase = "idle" | "confirming" | "submitting" | "submitError";

export type Notice =
  | { kind: "success"; from: string; to: string; totalCents: number }
  | { kind: "conflict" }
  | { kind: "notActive" }
  | { kind: "notFound" }
  | { kind: "refreshFailed" };

export interface State {
  load: "loading" | "error" | "ready";
  loadError: "notFound" | "failed" | null;
  data: Subscription | null;
  /** True while data is being reloaded after a rejected skip. The old data stays on screen. */
  refreshing: boolean;
  /** True when the reload after a rejected skip failed: what we show may be out of date. */
  stale: boolean;
  skip: SkipPhase;
  notice: Notice | null;
}

export type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_OK"; data: Subscription }
  | { type: "LOAD_FAIL"; reason: "notFound" | "failed" }
  | { type: "REFRESH_START" }
  | { type: "REFRESH_OK"; data: Subscription }
  | { type: "REFRESH_FAIL" }
  | { type: "SKIP_OPEN" }
  | { type: "SKIP_CANCEL" }
  | { type: "SKIP_SUBMIT" }
  | { type: "SKIP_OK"; data: Subscription }
  | { type: "SKIP_FAIL" }
  | { type: "SKIP_REJECTED"; notice: "conflict" | "notActive" }
  | { type: "SKIP_NOT_FOUND" }
  | { type: "DISMISS_NOTICE" };

export const initialState: State = {
  load: "loading",
  loadError: null,
  data: null,
  refreshing: false,
  stale: false,
  skip: "idle",
  notice: null,
};

export function canSkip(state: State): boolean {
  return state.load === "ready" && state.data?.status === "active" && !state.refreshing && !state.stale;
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...initialState };
    case "LOAD_OK":
      return { ...state, load: "ready", loadError: null, data: action.data };
    case "LOAD_FAIL":
      return { ...state, load: "error", loadError: action.reason };

    case "REFRESH_START":
      return { ...state, refreshing: true };
    case "REFRESH_OK":
      return {
        ...state,
        data: action.data,
        refreshing: false,
        stale: false,
        notice: state.notice?.kind === "refreshFailed" ? null : state.notice,
      };
    case "REFRESH_FAIL":
      return { ...state, refreshing: false, stale: true, notice: { kind: "refreshFailed" } };

    case "SKIP_OPEN":
      if (!canSkip(state) || state.skip !== "idle") return state;
      return { ...state, skip: "confirming", notice: null };
    case "SKIP_CANCEL":
      // Never while a request is in flight: closing would not cancel it and the result would be lost.
      if (state.skip !== "confirming" && state.skip !== "submitError") return state;
      return { ...state, skip: "idle" };
    case "SKIP_SUBMIT":
      if (state.skip !== "confirming" && state.skip !== "submitError") return state;
      return { ...state, skip: "submitting" };
    case "SKIP_OK":
      if (state.skip !== "submitting" || !state.data) return state;
      return {
        ...state,
        data: action.data,
        skip: "idle",
        notice: {
          kind: "success",
          from: state.data.nextChargeAt ?? "",
          to: action.data.nextChargeAt ?? "",
          totalCents: action.data.nextChargeTotalCents ?? 0,
        },
      };
    case "SKIP_FAIL":
      if (state.skip !== "submitting") return state;
      return { ...state, skip: "submitError" };
    case "SKIP_REJECTED":
      if (state.skip !== "submitting") return state;
      return { ...state, skip: "idle", notice: { kind: action.notice } };
    case "SKIP_NOT_FOUND":
      if (state.skip !== "submitting") return state;
      return { ...state, skip: "idle", notice: { kind: "notFound" } };

    case "DISMISS_NOTICE":
      return { ...state, notice: null };
  }
}
