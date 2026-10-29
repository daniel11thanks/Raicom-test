import { useRef } from "react";
import { ModalDialog } from "./ModalDialog";
import styles from "./SubscriptionCard.module.css";

interface InfoDialogProps {
  /** Prefix for the ids used by aria-labelledby and aria-describedby. */
  id: string;
  open: boolean;
  title: string;
  /** Plain text. These dialogs only inform; they never call the API or change anything. */
  text: string;
  onClose: () => void;
}

export function InfoDialog({ id, open, title, text, onClose }: InfoDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <ModalDialog open={open} onClose={onClose} titleId={`${id}-title`} descriptionId={`${id}-text`} initialFocusRef={closeRef}>
      <h2 id={`${id}-title`} className={styles.dialogTitle}>
        {title}
      </h2>
      <p id={`${id}-text`} className={styles.dialogText}>
        {text}
      </p>
      <div className={styles.dialogActions}>
        <button ref={closeRef} type="button" className={styles.primaryButton} onClick={onClose}>
          Close
        </button>
      </div>
    </ModalDialog>
  );
}
