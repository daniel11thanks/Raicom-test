import type { SubscriptionItem } from "../api/types";
import { formatPrice } from "../shared/format";
import { lineTotalCents } from "./format";
import styles from "./SubscriptionCard.module.css";

// What goes in the next shipment, with the price of each line. Plain text on purpose: the date and amount lead.
export function ShipmentItems({ items }: { items: SubscriptionItem[] }) {
  return (
    <ul className={styles.shipmentItems}>
      {items.map((item) => (
        <li key={item.sku} className={styles.shipmentItem}>
          <span>
            {item.name} × {item.quantity}
          </span>
          <span>{formatPrice(lineTotalCents(item))}</span>
        </li>
      ))}
    </ul>
  );
}
