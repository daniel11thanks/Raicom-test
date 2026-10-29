import type { ReactNode } from "react";
import styles from "./BuyBox.module.css";
import { RadioIcon } from "./icons";

interface PurchaseOptionProps {
  checked: boolean;
  onSelect: () => void;
  label: string;
  price: string;
  badge?: string;
  comparePrice?: string;
  children?: ReactNode;
}

export function PurchaseOption({ checked, onSelect, label, price, badge, comparePrice, children }: PurchaseOptionProps) {
  return (
    <div className={`${styles.option} ${checked ? styles.optionSelected : ""}`} onClick={onSelect}>
      <label className={`${styles.optionHeader} ${children ? styles.optionHeaderWithDetails : ""}`}>
        <input
          type="radio"
          name="purchase-option"
          className={styles.radioInput}
          checked={checked}
          onChange={onSelect}
        />
        <RadioIcon checked={checked} />
        <span className={styles.optionLabel}>{label}</span>
        {badge && <span className={styles.badge}>{badge}</span>}
        <span className={styles.prices}>
          <span className={styles.price}>{price}</span>
          {comparePrice && <span className={styles.comparePrice}>{comparePrice}</span>}
        </span>
      </label>
      {children}
    </div>
  );
}
