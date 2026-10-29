import type { Subscription } from "../api/types";
import { formatPrice } from "../shared/format";
import { subtotalCents } from "./format";
import styles from "./SubscriptionCard.module.css";

// Subtotal, discount and total: a quiet detail under the date and amount, not the headline.
export function ChargeDetails({ subscription }: { subscription: Subscription }) {
  const subtotal = subtotalCents(subscription.items);
  const total = subscription.nextChargeTotalCents ?? subtotal;
  // Derived from the API total, so the three lines always add up to what is charged.
  const discount = subtotal - total;
  return (
    <dl className={styles.charge}>
      <div className={styles.chargeRow}>
        <dt>Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div className={styles.chargeRow}>
        <dt>Subscribe &amp; save {subscription.discountPercent}%</dt>
        <dd>−{formatPrice(discount)}</dd>
      </div>
      <div className={`${styles.chargeRow} ${styles.chargeTotal}`}>
        <dt>Total</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
