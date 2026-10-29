import { useEffect, useRef, type MouseEvent, type ReactNode, type RefObject, type SyntheticEvent } from "react";
import styles from "./SubscriptionCard.module.css";

interface ModalDialogProps {
  open: boolean;
  /** While locked, Esc and a click on the backdrop do nothing (a request is in flight). */
  locked?: boolean;
  /** Called when the dialog was closed by the user (Esc, backdrop). Also fires after a programmatic close, so keep it idempotent. */
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  /** Element to focus when the dialog opens. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

// Native <dialog>: showModal() gives the focus trap, the inert page behind it and Esc. This wrapper adds the
// lock used while the skip request runs, and focus on the safe choice.
export function ModalDialog({ open, locked = false, onClose, titleId, descriptionId, initialFocusRef, children }: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  // Esc: stay open while locked (closing would not cancel the request and the result would be lost).
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (locked) event.preventDefault();
  };

  // Some browsers close on a second Esc even after preventDefault. Reopen if we are still locked;
  // otherwise this is a real close and the state follows it.
  const handleClose = () => {
    const dialog = dialogRef.current;
    if (locked && dialog && !dialog.open) {
      dialog.showModal();
      return;
    }
    onClose();
  };

  // A click on the backdrop targets the <dialog> itself (the body wrapper fills the rest).
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && !locked) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleBackdropClick}
    >
      <div className={styles.dialogBody}>{children}</div>
    </dialog>
  );
}
