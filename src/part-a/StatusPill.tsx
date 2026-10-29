import type { SubscriptionStatus } from "../api/types";
import styles from "./SubscriptionCard.module.css";

const LABEL = { active: "Active", paused: "Paused", cancelled: "Cancelled" } as const;
const CLASS = { active: styles.pillActive, paused: styles.pillPaused, cancelled: styles.pillCancelled } as const;

const ICON = {
  active: <path d="M3.5 7.5 6 10l4.5-5" />,
  paused: <path d="M5 4v6M9 4v6" />,
  cancelled: <path d="m4.5 4.5 5 5m0-5-5 5" />,
};

// Status is never only a color: every pill has its own icon and word.
export function StatusPill({ status }: { status: SubscriptionStatus }) {
  return (
    <span className={`${styles.pill} ${CLASS[status]}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {ICON[status]}
      </svg>
      {LABEL[status]}
    </span>
  );
}
