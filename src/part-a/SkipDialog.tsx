import { useRef } from "react";
import type { Subscription } from "../api/types";
import { formatPrice } from "../shared/format";
import { formatDate, nextChargeAfterSkip } from "./format";
import { ModalDialog } from "./ModalDialog";
import type { SkipPhase } from "./subscriptionReducer";
import styles from "./SubscriptionCard.module.css";

interface SkipDialogProps {
  subscription: Subscription;
  phase: SkipPhase;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SkipDialog({ subscription, phase, onConfirm, onCancel }: SkipDialogProps) {
  const keepRef = useRef<HTMLButtonElement>(null);
  const submitting = phase === "submitting";

  const from = subscription.nextChargeAt ?? "";
  const to = from ? nextChargeAfterSkip(from, subscription.intervalDays) : "";
  const total = subscription.nextChargeTotalCents ?? 0;

  const confirmLabel = submitting ? "Skipping…" : phase === "submitError" ? "Try again" : "Yes, skip shipment";

  return (
    <ModalDialog
      open={phase !== "idle"}
      locked={submitting}
      onClose={onCancel}
      titleId="skip-title"
      descriptionId="skip-description"
      // Start on the safe choice, so Enter or a stray tap does not skip.
      initialFocusRef={keepRef}
    >
      <h2 id="skip-title" className={styles.dialogTitle}>
        Skip your next shipment?
      </h2>
      <p id="skip-description" className={styles.dialogText}>
        Your {formatPrice(total)} charge on <strong>{from && formatDate(from, { weekday: true })}</strong> will move to{" "}
        <strong>{to && formatDate(to, { weekday: true })}</strong>.
      </p>
      <p className={styles.dialogText}>Your subscription stays active.</p>

      {phase === "submitError" && (
        <p role="alert" className={styles.dialogError}>
          Something went wrong. Your shipment wasn't skipped.
        </p>
      )}

      <div className={styles.dialogActions}>
        {/* aria-disabled instead of disabled: the focused button keeps focus while the request runs. */}
        <button
          type="button"
          className={styles.primaryButton}
          aria-disabled={submitting}
          onClick={() => {
            if (!submitting) onConfirm();
          }}
        >
          {confirmLabel}
        </button>
        <button
          ref={keepRef}
          type="button"
          className={styles.secondaryButton}
          aria-disabled={submitting}
          onClick={() => {
            if (!submitting) onCancel();
          }}
        >
          Keep my shipment
        </button>
      </div>
    </ModalDialog>
  );
}
