import { formatPrice } from "../shared/format";
import { formatDate } from "./format";
import type { Notice as NoticeState } from "./subscriptionReducer";
import styles from "./SubscriptionCard.module.css";

interface NoticeProps {
  notice: NoticeState;
  onReload: () => void;
  onRetryRefresh: () => void;
}

// Titles say "shipment" (what the customer did); sentences about money and dates say "charge".
export function Notice({ notice, onReload, onRetryRefresh }: NoticeProps) {
  switch (notice.kind) {
    case "success":
      return (
        <div className={`${styles.notice} ${styles.noticeSuccess}`}>
          <p className={styles.noticeTitle}>Shipment skipped</p>
          <p className={styles.noticeText}>
            Your {formatPrice(notice.totalCents)} charge is now on {formatDate(notice.to, { weekday: true })} (was{" "}
            {formatDate(notice.from, { weekday: true })}).
          </p>
        </div>
      );
    case "conflict":
      return (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>Your subscription changed</p>
          <p className={styles.noticeText}>
            It was updated somewhere else, so we didn't skip your shipment. We've refreshed the details below. Check
            them and skip again if you still want to.
          </p>
        </div>
      );
    case "notActive":
      return (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>Shipment not skipped</p>
          <p className={styles.noticeText}>
            This subscription can't skip a shipment right now. We've refreshed the details below.
          </p>
        </div>
      );
    case "notFound":
      return (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>Shipment not skipped</p>
          <p className={styles.noticeText}>We couldn't find this subscription.</p>
          <button type="button" className={styles.noticeButton} onClick={onReload}>
            Reload
          </button>
        </div>
      );
    case "refreshFailed":
      return (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>Couldn't refresh</p>
          <p className={styles.noticeText}>
            We couldn't refresh your subscription. Skipping is unavailable until it loads.
          </p>
          <button type="button" className={styles.noticeButton} onClick={onRetryRefresh}>
            Try again
          </button>
        </div>
      );
  }
}
