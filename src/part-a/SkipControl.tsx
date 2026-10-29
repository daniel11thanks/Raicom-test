import { useState, type Ref } from "react";
import { formatDate, nextChargeAfterSkip } from "./format";
import { InfoDialog } from "./InfoDialog";
import styles from "./SubscriptionCard.module.css";

const MAX_SHIPMENTS = 6;
const COUNTS = Array.from({ length: MAX_SHIPMENTS }, (_, i) => i + 1);

interface SkipControlProps {
  /** ISO date of the next charge, and the days between charges: the date each choice leads to is computed from them. */
  nextChargeAt: string;
  intervalDays: number;
  canSkip: boolean;
  /** The real skip: opens the confirmation dialog and calls the API. */
  onSkip: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}

// The API can only skip one shipment per call. Choosing 2 to 6 is allowed (a disabled option would look broken and
// would not say why): each option shows where it would lead, the hint under it says it is not available yet, and
// pressing the button explains it in a dialog. Changing the select never opens anything.
export function SkipControl({ nextChargeAt, intervalDays, canSkip, onSkip, buttonRef }: SkipControlProps) {
  const [count, setCount] = useState(1);
  const [infoOpen, setInfoOpen] = useState(false);

  // Back to the one choice that works. This is local screen state only; nothing about the subscription changes.
  const closeInfo = () => {
    setInfoOpen(false);
    setCount(1);
  };

  const dateFor = (shipments: number) => formatDate(nextChargeAfterSkip(nextChargeAt, intervalDays, shipments));

  return (
    <div className={styles.skipControl}>
      <label htmlFor="skip-count" className={styles.skipLabel}>
        Shipments to skip
      </label>
      <div className={styles.selectWrap}>
        <select
          id="skip-count"
          className={styles.select}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          aria-describedby="skip-preview skip-hint"
        >
          {COUNTS.map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "shipment" : "shipments"} · {dateFor(n)}
            </option>
          ))}
        </select>
        <svg className={styles.selectChevron} width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1.5 1.5 6 6l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Not a live region: changing the select already announces the option, and the option carries the date. */}
      <p id="skip-preview" className={styles.skipPreview}>
        Your next charge would be on {dateFor(count)}.
      </p>
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
