import styles from "./BuyBox.module.css";
import { MinusIcon, PlusIcon } from "./icons";

interface QuantityStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, min, max, onChange }: QuantityStepperProps) {
  return (
    <div className={styles.stepper} role="group" aria-label="Quantity">
      <button
        type="button"
        className={styles.stepperButton}
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <MinusIcon />
      </button>
      <span className={styles.stepperValue} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={styles.stepperButton}
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
