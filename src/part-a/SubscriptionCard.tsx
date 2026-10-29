// Part A: the "Manage my subscription" card. State lives in useSubscription (reducer + API calls).
import { useEffect, useRef } from "react";
import type { Subscription } from "../api/types";
import { formatPrice } from "../shared/format";
import { formatDate, subtotalCents } from "./format";
import { ItemList } from "./ItemList";
import { Notice } from "./Notice";
import { SkipDialog } from "./SkipDialog";
import { canSkip } from "./subscriptionReducer";
import styles from "./SubscriptionCard.module.css";
import { useSubscription } from "./useSubscription";

const STATUS_LABEL = { active: "Active", paused: "Paused", cancelled: "Cancelled" } as const;
const STATUS_PILL = { active: styles.pillActive, paused: styles.pillPaused, cancelled: styles.pillCancelled } as const;
const STATUS_BLOCK = { active: styles.blockActive, paused: styles.blockPaused, cancelled: styles.blockCancelled } as const;

function StatusIcon({ status }: { status: Subscription["status"] }) {
  const paths = {
    active: <path d="M3.5 7.5 6 10l4.5-5" />,
    paused: <path d="M5 4v6M9 4v6" />,
    cancelled: <path d="m4.5 4.5 5 5m0-5-5 5" />,
  };
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[status]}
    </svg>
  );
}

function StatusBlock({ subscription }: { subscription: Subscription }) {
  const { status, nextChargeAt, nextChargeTotalCents, pausedUntil, cancelledAt, intervalDays } = subscription;
  return (
    <div className={`${styles.block} ${STATUS_BLOCK[status]}`}>
      {status === "active" && nextChargeAt && nextChargeTotalCents !== null && (
        <>
          <p className={styles.blockLabel}>Next charge</p>
          <p className={styles.blockMain}>
            {formatPrice(nextChargeTotalCents)} on {formatDate(nextChargeAt, { weekday: true })}
          </p>
          <p className={styles.blockSub}>Every {intervalDays} days</p>
        </>
      )}
      {status === "paused" && (
        <>
          <p className={styles.blockMain}>Paused until {pausedUntil ? formatDate(pausedUntil) : "further notice"}</p>
          <p className={styles.blockSub}>No charges while paused.</p>
        </>
      )}
      {status === "cancelled" && (
        <>
          <p className={styles.blockMain}>Cancelled on {cancelledAt ? formatDate(cancelledAt) : "an earlier date"}</p>
          <p className={styles.blockSub}>No further charges.</p>
        </>
      )}
    </div>
  );
}

function Summary({ subscription }: { subscription: Subscription }) {
  const subtotal = subtotalCents(subscription.items);
  const total = subscription.nextChargeTotalCents ?? subtotal;
  // Derived from the API total, so the three lines always add up to what is charged.
  const discount = subtotal - total;
  return (
    <dl className={styles.summary}>
      <div className={styles.summaryRow}>
        <dt>Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div className={styles.summaryRow}>
        <dt>Subscribe &amp; save {subscription.discountPercent}%</dt>
        <dd>−{formatPrice(discount)}</dd>
      </div>
      <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
        <dt>Total</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true">
      <div className={`${styles.skeleton} ${styles.skeletonBlock}`} />
      <div className={`${styles.skeleton} ${styles.skeletonRow}`} />
      <div className={`${styles.skeleton} ${styles.skeletonRow}`} />
      <div className={`${styles.skeleton} ${styles.skeletonButton}`} />
    </div>
  );
}

export function SubscriptionCard() {
  const { state, retryLoad, retryRefresh, openSkip, cancelSkip, confirmSkip } = useSubscription();
  const { data, notice } = state;
  const skipButton = useRef<HTMLButtonElement>(null);

  // The native dialog restores focus on close, but the button can be re-rendered or disabled meanwhile.
  const dialogWasOpen = useRef(false);
  useEffect(() => {
    const isOpen = state.skip !== "idle";
    if (dialogWasOpen.current && !isOpen) skipButton.current?.focus();
    dialogWasOpen.current = isOpen;
  }, [state.skip]);

  const isActive = data?.status === "active";
  const success = notice?.kind === "success" ? notice : null;
  const problem = notice && notice.kind !== "success" ? notice : null;

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="subscription-title" aria-busy={state.load === "loading" || state.refreshing}>
        <header className={styles.header}>
          <h1 id="subscription-title" className={styles.title}>
            Manage my subscription
          </h1>
          {data && (
            <span className={`${styles.pill} ${STATUS_PILL[data.status]}`}>
              <StatusIcon status={data.status} />
              {STATUS_LABEL[data.status]}
            </span>
          )}
        </header>

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
            <Skeleton />
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
          <>
            <StatusBlock subscription={data} />
            <h2 className={styles.sectionTitle}>{isActive ? "Your products" : "Products in this subscription"}</h2>
            <ItemList items={data.items} showPrices={isActive} />
            {isActive && <Summary subscription={data} />}

            {/* Paused and cancelled subscriptions never get a skip button. */}
            {isActive && (
              <button
                ref={skipButton}
                type="button"
                className={styles.skipButton}
                disabled={!canSkip(state)}
                onClick={openSkip}
              >
                Skip next shipment
              </button>
            )}
          </>
        )}
      </section>

      {isActive && data && (
        <SkipDialog subscription={data} phase={state.skip} onConfirm={confirmSkip} onCancel={cancelSkip} />
      )}
    </main>
  );
}
