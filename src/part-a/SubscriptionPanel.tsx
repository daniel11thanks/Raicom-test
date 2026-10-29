import type { Subscription } from "../api/types";
import { ItemList } from "./ItemList";
import { StatusPill } from "./StatusPill";
import styles from "./SubscriptionCard.module.css";

// The subscription as a whole: status, what is in it, how often and with what discount.
export function SubscriptionPanel({ subscription }: { subscription: Subscription }) {
  const { status, items, intervalDays, discountPercent } = subscription;
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
    </section>
  );
}
