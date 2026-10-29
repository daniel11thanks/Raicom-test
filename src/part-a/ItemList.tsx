import type { SubscriptionItem } from "../api/types";
import styles from "./SubscriptionCard.module.css";

// What the customer subscribed to: image, name and quantity. Prices live in the next shipment panel.
export function ItemList({ items }: { items: SubscriptionItem[] }) {
  return (
    <ul className={styles.items}>
      {items.map((item) => (
        <li key={item.sku} className={styles.item}>
          {item.imageUrl ? (
            <img className={styles.thumb} src={item.imageUrl} alt="" />
          ) : (
            <span className={styles.thumbPlaceholder} aria-hidden="true">
              {item.name.charAt(0)}
            </span>
          )}
          <span className={styles.itemText}>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemQty}>Qty {item.quantity}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
