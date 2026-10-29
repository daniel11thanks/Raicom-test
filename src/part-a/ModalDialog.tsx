import { useEffect, useRef, type MouseEvent, type ReactNode, type RefObject, type SyntheticEvent } from "react";
import styles from "./SubscriptionCard.module.css";

interface ModalDialogProps {
  open: boolean;
  /** While locked, Esc and a click on the backdrop do nothing (a request is in flight). */
  locked?: boolean;
  /** Called when the user asks to close (Esc, backdrop) or the browser closed the dialog on its own. */
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  /** Element to focus when the dialog opens. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

// Native <dialog>: showModal() gives the focus trap, the inert page behind it and Esc. This wrapper adds the
// lock used while the skip request runs, and focus on the safe choice. React state is the single source of truth:
// `open` decides whether the dialog is shown, and the effect below makes the DOM follow it.
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

  // Esc. The browser never closes the dialog on its own here: we cancel its default and let the state do it.
  // While locked nothing happens (closing would not cancel the request and the result would be lost).
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (!locked) onClose();
  };

  // The "close" event arrives later, as its own task, and can arrive late or in pairs. It only matters when the
  // browser closed the dialog by itself (for example Chrome closing on a second Esc after a prevented one): then
  // `open` is still true but the dialog is shut. Every late event of a close we made ourselves, or of a dialog
  // that was reopened meanwhile, fails that test and is ignored, so it cannot undo what the user did since.
  const handleClose = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open || !open) return;
    if (locked) {
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
