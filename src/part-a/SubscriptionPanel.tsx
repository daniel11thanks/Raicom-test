import { useState } from "react";
import type { Subscription } from "../api/types";
import { formatDate } from "./format";
import { InfoDialog } from "./InfoDialog";
import { ItemList } from "./ItemList";
import { StatusPill } from "./StatusPill";
import styles from "./SubscriptionCard.module.css";

// The subscription as a whole: status, what is in it, how often and with what discount.
export function SubscriptionPanel({ subscription }: { subscription: Subscription }) {
  const { status, items, intervalDays, discountPercent, nextChargeAt } = subscription;
  const [cancelOpen, setCancelOpen] = useState(false);

  // Honest about what happened: nothing. There is no cancellation to offer yet, and no support channel to point to.
  const cancelText =
    status === "active" && nextChargeAt
      ? `We can't cancel a subscription from this page yet. Nothing was changed: your subscription is active and your next charge is still on ${formatDate(nextChargeAt, { weekday: true })}.`
      : "We can't cancel a subscription from this page yet. Your subscription hasn't changed.";

  return (
    <section className={styles.panel} aria-labelledby="subscription-panel-title">
      <div className={styles.panelHeader}>
        <h2 id="subscription-panel-title" className={styles.panelTitle}>
          Your subscription
        </h2>
        <StatusPill status={status} />
      </div>

      <ItemList items={items} />

      {/* A cancelled subscription no longer has a frequency or a discount worth showing. */}
      {status !== "cancelled" && (
        <dl className={styles.facts}>
          <div className={styles.factRow}>
            <dt>Delivery</dt>
            <dd>Every {intervalDays} days</dd>
          </div>
          <div className={styles.factRow}>
            <dt>Discount</dt>
            <dd>Subscribe &amp; save {discountPercent}%</dd>
          </div>
        </dl>
      )}

      {/* Shown for active and paused subscriptions, never for a cancelled one. Informational only. */}
      {status !== "cancelled" && (
        <div className={styles.panelFooter}>
          <button type="button" className={styles.cancelButton} onClick={() => setCancelOpen(true)}>
            Cancel subscription
          </button>
          <InfoDialog
            id="cancel-subscription"
            open={cancelOpen}
            title="Cancellation isn't available yet"
            text={cancelText}
            onClose={() => setCancelOpen(false)}
          />
        </div>
      )}
    </section>
  );
}
