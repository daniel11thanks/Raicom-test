// Part A: "Manage my subscription". One block holding the title, the notices and two panels: the subscription as a
// whole, and the next shipment. State lives in useSubscription (reducer + API calls).
import { useEffect, useRef } from "react";
import { useContainerAtLeast } from "../shared/useContainerWidth";
import { NextShipmentPanel } from "./NextShipmentPanel";
import { Notice } from "./Notice";
import { SkipDialog } from "./SkipDialog";
import { SubscriptionPanel } from "./SubscriptionPanel";
import { canSkip } from "./subscriptionReducer";
import styles from "./SubscriptionCard.module.css";
import { useSubscription } from "./useSubscription";

// The block is as wide as its container allows, not as wide as the window. Two columns start when the block itself
// is this wide. Keep it equal to the @container (min-width: ...) threshold in SubscriptionCard.module.css.
const TWO_COLUMNS_MIN_WIDTH = 720;

// Two columns read left to right: the subscription, then what happens next. In one column the next shipment comes
// first. The order is decided here, in the DOM (not with CSS order), so keyboard and screen reader order always
// matches what the eye sees.

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
  const blockRef = useRef<HTMLElement>(null);
  // null until the block has been measured (before the first paint). Nothing that depends on it renders before that.
  const twoColumns = useContainerAtLeast(blockRef, TWO_COLUMNS_MIN_WIDTH);
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
  const measured = twoColumns !== null;

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
      <section ref={blockRef} className={styles.block} aria-labelledby="subscription-heading">
        <div className={styles.blockInner}>
          <h1 id="subscription-heading" className={styles.pageTitle}>
            Manage my subscription
          </h1>

          {/* Always mounted so screen readers pick up what is inserted into them. */}
          <div role="status" aria-live="polite">
            {success && <Notice notice={success} onReload={retryLoad} onRetryRefresh={retryRefresh} />}
            {state.refreshing && <p className={styles.refreshing}>Refreshing your subscription…</p>}
          </div>
          <div role="alert">
            {problem && <Notice notice={problem} onReload={retryLoad} onRetryRefresh={retryRefresh} />}
          </div>

          {state.load === "loading" && measured && (
            <>
              <p className={styles.srOnly} role="status">
                Loading your subscription…
              </p>
              <div className={styles.panels} aria-hidden="true">
                {twoColumns ? (
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

          {state.load === "ready" && data && measured && (
            <div className={styles.panels}>
              {twoColumns ? [subscriptionPanel, nextShipmentPanel] : [nextShipmentPanel, subscriptionPanel]}
            </div>
          )}
        </div>
      </section>

      {isActive && data && (
        <SkipDialog subscription={data} phase={state.skip} onConfirm={confirmSkip} onCancel={cancelSkip} />
      )}
    </main>
  );
}
