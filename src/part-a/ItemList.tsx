import type { SubscriptionItem } from "../api/types";
import { formatPrice } from "../shared/format";
import { lineTotalCents } from "./format";
import styles from "./SubscriptionCard.module.css";

interface ItemListProps {
  items: SubscriptionItem[];
  /** Prices are only shown while the subscription is active. */
  showPrices: boolean;
}

export function ItemList({ items, showPrices }: ItemListProps) {
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
          {showPrices && <span className={styles.itemPrice}>{formatPrice(lineTotalCents(item))}</span>}
        </li>
      ))}
    </ul>
  );
}
