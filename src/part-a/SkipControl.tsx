import { useState, type Ref } from "react";
import { InfoDialog } from "./InfoDialog";
import styles from "./SubscriptionCard.module.css";

const COUNTS = [1, 2, 3];

interface SkipControlProps {
  canSkip: boolean;
  /** The real skip: opens the confirmation dialog and calls the API. */
  onSkip: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}

// The API can only skip one shipment per call. Choosing 2 or 3 is allowed (a disabled option would look broken and
// would not say why), the hint above the button says so up front, and pressing the button explains it in a dialog.
export function SkipControl({ canSkip, onSkip, buttonRef }: SkipControlProps) {
  const [count, setCount] = useState(1);
  const [infoOpen, setInfoOpen] = useState(false);

  // Back to the one choice that works. This is local screen state only; nothing about the subscription changes.
  const closeInfo = () => {
    setInfoOpen(false);
    setCount(1);
  };

  return (
    <div className={styles.skipControl}>
      <fieldset className={styles.skipFieldset}>
        <legend className={styles.skipLegend}>Shipments to skip</legend>
        <div className={styles.segments}>
          {COUNTS.map((n) => (
            <label key={n} className={`${styles.segment} ${n > 1 ? styles.segmentLimited : ""}`}>
              <input
                type="radio"
                name="skip-count"
                value={n}
                checked={count === n}
                onChange={() => setCount(n)}
                className={styles.segmentInput}
                aria-describedby="skip-hint"
              />
              <span>{n}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p id="skip-hint" className={styles.skipHint}>
        For now, shipments can only be skipped one at a time.
      </p>

      <button
        ref={buttonRef}
        type="button"
        className={styles.skipButton}
        aria-disabled={!canSkip}
        aria-describedby="skip-hint"
        onClick={() => {
          if (!canSkip) return;
          if (count === 1) onSkip();
          else setInfoOpen(true);
        }}
      >
        {count === 1 ? "Skip next shipment" : `Skip next ${count} shipments`}
      </button>

      <InfoDialog
        id="multi-skip"
        open={infoOpen}
        title="Skipping several shipments isn't available yet"
        text="For now you can skip one shipment at a time. Once your next shipment is skipped, you can skip the one after it."
        onClose={closeInfo}
      />
    </div>
  );
}
