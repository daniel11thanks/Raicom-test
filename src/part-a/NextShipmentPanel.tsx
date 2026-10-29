import type { Ref } from "react";
import type { Subscription } from "../api/types";
import { formatPrice } from "../shared/format";
import { ChargeDetails } from "./ChargeDetails";
import { formatDate } from "./format";
import { ShipmentItems } from "./ShipmentItems";
import { SkipControl } from "./SkipControl";
import styles from "./SubscriptionCard.module.css";

interface NextShipmentPanelProps {
  subscription: Subscription;
  canSkip: boolean;
  onSkip: () => void;
  skipButtonRef: Ref<HTMLButtonElement>;
}

// What happens next: date and amount lead; items and charge details support them; the skip sits right below.
export function NextShipmentPanel({ subscription, canSkip, onSkip, skipButtonRef }: NextShipmentPanelProps) {
  const { status, nextChargeAt, nextChargeTotalCents, pausedUntil, cancelledAt } = subscription;
  const upcoming = status === "active" && nextChargeAt && nextChargeTotalCents !== null;

  return (
    <section className={`${styles.panel} ${upcoming ? styles.panelNext : ""}`} aria-labelledby="next-shipment-title">
      <h2 id="next-shipment-title" className={styles.panelTitle}>
        Next shipment
      </h2>

      {upcoming && (
        <>
          <p className={styles.heroDate}>{formatDate(nextChargeAt, { weekday: true })}</p>
          <p className={styles.heroAmount}>{formatPrice(nextChargeTotalCents)} will be charged</p>

          <ShipmentItems items={subscription.items} />
          <ChargeDetails subscription={subscription} />

          <SkipControl
            nextChargeAt={nextChargeAt}
            intervalDays={subscription.intervalDays}
            canSkip={canSkip}
            onSkip={onSkip}
            buttonRef={skipButtonRef}
          />
        </>
      )}

      {status === "paused" && (
        <div className={`${styles.emptyState} ${styles.blockPaused}`}>
          <p className={styles.blockMain}>No shipment scheduled</p>
          <p className={styles.blockSub}>
            Paused until {pausedUntil ? formatDate(pausedUntil) : "further notice"}. No charges while paused.
          </p>
        </div>
      )}

      {status === "cancelled" && (
        <div className={`${styles.emptyState} ${styles.blockCancelled}`}>
          <p className={styles.blockMain}>No shipment scheduled</p>
          <p className={styles.blockSub}>
            Cancelled on {cancelledAt ? formatDate(cancelledAt) : "an earlier date"}. No further charges.
          </p>
        </div>
      )}
    </section>
  );
}
