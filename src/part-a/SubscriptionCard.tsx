// Part A: "Manage my subscription". Two panels: the subscription as a whole, and the next shipment.
// State lives in useSubscription (reducer + API calls).
import { useEffect, useRef } from "react";
import { useMediaQuery } from "../shared/useMediaQuery";
import { NextShipmentPanel } from "./NextShipmentPanel";
import { Notice } from "./Notice";
import { SkipDialog } from "./SkipDialog";
import { SubscriptionPanel } from "./SubscriptionPanel";
import { canSkip } from "./subscriptionReducer";
import styles from "./SubscriptionCard.module.css";
import { useSubscription } from "./useSubscription";

// Desktop reads left to right: the subscription, then what happens next. On a phone the next shipment comes
// first. The order is decided here, in the DOM (not with CSS order), so keyboard and screen reader order
// always matches what the eye sees.
const WIDE = "(min-width: 768px)";

function SkeletonSubscription() {
  return (
    <div className={styles.panel}>
      <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
      <div className={`${styles.skeleton} ${styles.skeletonRow}`} />
      <div className={`${styles.skeleton} ${styles.skeletonRow}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
    </div>
  );
}

function SkeletonNextShipment() {
  return (
    <div className={`${styles.panel} ${styles.panelNext}`}>
      <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
      <div className={`${styles.skeleton} ${styles.skeletonHero}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
      <div className={`${styles.skeleton} ${styles.skeletonButton}`} />
    </div>
  );
}

export function SubscriptionCard() {
  const { state, retryLoad, retryRefresh, openSkip, cancelSkip, confirmSkip } = useSubscription();
  const wide = useMediaQuery(WIDE);
  const { data, notice } = state;
  const skipButton = useRef<HTMLButtonElement>(null);

  // The native dialog restores focus on close, but the button can be re-rendered or aria-disabled meanwhile.
  const dialogWasOpen = useRef(false);
  useEffect(() => {
    const isOpen = state.skip !== "idle";
    if (dialogWasOpen.current && !isOpen) skipButton.current?.focus();
    dialogWasOpen.current = isOpen;
  }, [state.skip]);

  const isActive = data?.status === "active";
  const success = notice?.kind === "success" ? notice : null;
  const problem = notice && notice.kind !== "success" ? notice : null;

  const subscriptionPanel = data && <SubscriptionPanel key="subscription" subscription={data} />;
  const nextShipmentPanel = data && (
    <NextShipmentPanel
      key="next"
      subscription={data}
      canSkip={canSkip(state)}
      onSkip={openSkip}
      skipButtonRef={skipButton}
    />
  );

  return (
    <main className={styles.page} aria-busy={state.load === "loading" || state.refreshing}>
      <h1 className={styles.pageTitle}>Manage my subscription</h1>

      {/* Always mounted so screen readers pick up what is inserted into them. */}
      <div role="status" aria-live="polite">
        {success && <Notice notice={success} onReload={retryLoad} onRetryRefresh={retryRefresh} />}
        {state.refreshing && <p className={styles.refreshing}>Refreshing your subscription…</p>}
      </div>
      <div role="alert">
        {problem && <Notice notice={problem} onReload={retryLoad} onRetryRefresh={retryRefresh} />}
      </div>

      {state.load === "loading" && (
        <>
          <p className={styles.srOnly} role="status">
            Loading your subscription…
          </p>
          <div className={styles.panels} aria-hidden="true">
            {wide ? (
              <>
                <SkeletonSubscription />
                <SkeletonNextShipment />
              </>
            ) : (
              <>
                <SkeletonNextShipment />
                <SkeletonSubscription />
              </>
            )}
          </div>
        </>
      )}

      {state.load === "error" && (
        <div className={styles.loadError} role="alert">
          <p className={styles.noticeTitle}>
            {state.loadError === "notFound" ? "We couldn't find your subscription." : "We couldn't load your subscription."}
          </p>
          <p className={styles.noticeText}>
            {state.loadError === "notFound"
              ? "Check the link and try again."
              : "Something went wrong on our end. Please try again."}
          </p>
          <button type="button" className={styles.primaryButton} onClick={retryLoad}>
            Try again
          </button>
        </div>
      )}

      {state.load === "ready" && data && (
        <div className={styles.panels}>{wide ? [subscriptionPanel, nextShipmentPanel] : [nextShipmentPanel, subscriptionPanel]}</div>
      )}

      {isActive && data && (
        <SkipDialog subscription={data} phase={state.skip} onConfirm={confirmSkip} onCancel={cancelSkip} />
      )}
    </main>
  );
}
