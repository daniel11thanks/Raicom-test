import { useEffect, useRef, type MouseEvent } from "react";
import type { Subscription } from "../api/types";
import { formatPrice } from "../shared/format";
import { formatDate, nextChargeAfterSkip } from "./format";
import type { SkipPhase } from "./subscriptionReducer";
import styles from "./SubscriptionCard.module.css";

interface SkipDialogProps {
  subscription: Subscription;
  phase: SkipPhase;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SkipDialog({ subscription, phase, onConfirm, onCancel }: SkipDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const open = phase !== "idle";
  const submitting = phase === "submitting";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Start on the safe choice, so Enter or a stray tap does not skip.
      keepRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Esc: stay open while a request is in flight (closing would not cancel it and the result would be lost).
  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    if (submitting) event.preventDefault();
  };

  // Some browsers close on a second Esc even after preventDefault. Reopen if we are still submitting;
  // otherwise this is a real close and the state follows it.
  const handleClose = () => {
    const dialog = dialogRef.current;
    if (submitting && dialog && !dialog.open) {
      dialog.showModal();
      return;
    }
    onCancel();
  };

  // A click on the backdrop targets the <dialog> itself (the content wrapper fills the rest).
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && !submitting) onCancel();
  };

  const from = subscription.nextChargeAt ?? "";
  const to = from ? nextChargeAfterSkip(from, subscription.intervalDays) : "";
  const total = subscription.nextChargeTotalCents ?? 0;

  const confirmLabel = submitting ? "Skipping…" : phase === "submitError" ? "Try again" : "Yes, skip shipment";

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="skip-title"
      aria-describedby="skip-description"
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleBackdropClick}
    >
      <div className={styles.dialogBody}>
        <h2 id="skip-title" className={styles.dialogTitle}>
          Skip your next shipment?
        </h2>
        <p id="skip-description" className={styles.dialogText}>
          Your {formatPrice(total)} charge on <strong>{from && formatDate(from, { weekday: true })}</strong> will move
          to <strong>{to && formatDate(to, { weekday: true })}</strong>.
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
      </div>
    </dialog>
  );
}
