// Part B: rebuild public/reference/buy-box.png here.
// Text is transcribed from the reference image. Anything that changes (prices, discount,
// delivery frequency, quantity) is defined below and derived from, never typed into the JSX.
import { useState } from "react";
import styles from "./BuyBox.module.css";
import { CheckCircleIcon, CheckIcon, ChevronIcon, StarIcon } from "./icons";
import { formatPrice } from "./format";
import { PurchaseOption } from "./PurchaseOption";
import { QuantityStepper } from "./QuantityStepper";

const ONE_TIME_PRICE_CENTS = 2995;
const DISCOUNT_PERCENT = 15;
const SUBSCRIBE_PRICE_CENTS = Math.round((ONE_TIME_PRICE_CENTS * (100 - DISCOUNT_PERCENT)) / 100);
const FREQUENCY_OPTIONS_DAYS = [30, 60, 90];
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;
const STAR_COUNT = 5;

const PERKS = ["Skip, pause, or cancel anytime", "Free shipping on every order"];
const TRUST_BADGES = ["Third-party tested", "Non-GMO", "Made in the USA"];

type PurchaseMode = "oneTime" | "subscribe";

export function BuyBox() {
  const [mode, setMode] = useState<PurchaseMode>("subscribe");
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [frequencyDays, setFrequencyDays] = useState(FREQUENCY_OPTIONS_DAYS[0]);

  const isSubscribe = mode === "subscribe";
  const unitPriceCents = isSubscribe ? SUBSCRIBE_PRICE_CENTS : ONE_TIME_PRICE_CENTS;
  const totalCents = unitPriceCents * quantity;

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.photoCard}>
          <img className={styles.photo} src="/product.jpg" alt="Natura Wellness Vitamin D bottle, 60 softgels" />
        </div>

        <div className={styles.details}>
          <p className={styles.eyebrow}>Vitamins</p>

          <div className={styles.ratingRow}>
            <span className={styles.stars} role="img" aria-label="4.8 out of 5 stars">
              {Array.from({ length: STAR_COUNT }, (_, i) => (
                <StarIcon key={i} />
              ))}
            </span>
            <span className={styles.ratingValue}>4.8</span>
            <a className={styles.reviewsLink} href="#reviews">
              2,316 reviews
            </a>
          </div>

          <h1 className={styles.title}>Vitamin D</h1>
          <p className={styles.subtitle}>2,000 IU (50 mcg) of vitamin D per softgel. One softgel a day, with food.</p>

          <hr className={styles.divider} />

          <div className={styles.options}>
            <PurchaseOption
              checked={!isSubscribe}
              onSelect={() => setMode("oneTime")}
              label="One-time purchase"
              price={formatPrice(ONE_TIME_PRICE_CENTS)}
            />

            <PurchaseOption
              checked={isSubscribe}
              onSelect={() => setMode("subscribe")}
              label={`Subscribe & save ${DISCOUNT_PERCENT}%`}
              badge="Best value"
              price={formatPrice(SUBSCRIBE_PRICE_CENTS)}
              comparePrice={formatPrice(ONE_TIME_PRICE_CENTS)}
            >
              <div className={styles.frequencyRow}>
                <label htmlFor="frequency" className={styles.frequencyLabel}>
                  Delivered every
                </label>
                <span className={styles.selectWrap}>
                  <select
                    id="frequency"
                    className={styles.select}
                    value={frequencyDays}
                    onChange={(event) => setFrequencyDays(Number(event.target.value))}
                  >
                    {FREQUENCY_OPTIONS_DAYS.map((days) => (
                      <option key={days} value={days}>
                        {days} days
                      </option>
                    ))}
                  </select>
                  <span className={styles.selectChevron}>
                    <ChevronIcon />
                  </span>
                </span>
              </div>

              <ul className={styles.perks}>
                {PERKS.map((perk) => (
                  <li key={perk} className={styles.perk}>
                    <CheckIcon />
                    {perk}
                  </li>
                ))}
              </ul>
            </PurchaseOption>
          </div>

          <div className={styles.purchaseRow}>
            <QuantityStepper value={quantity} min={MIN_QUANTITY} max={MAX_QUANTITY} onChange={setQuantity} />
            <button type="button" className={styles.addToCart}>
              Add to cart
              <span className={styles.dot} aria-hidden="true">
                ·
              </span>
              {formatPrice(totalCents)}
            </button>
          </div>

          <ul className={styles.trust}>
            {TRUST_BADGES.map((badge) => (
              <li key={badge} className={styles.trustItem}>
                <CheckCircleIcon />
                {badge}
              </li>
            ))}
          </ul>

          {isSubscribe && (
            <p className={styles.finePrint}>
              Your subscription renews every {frequencyDays} days at {formatPrice(totalCents)} until you cancel. Skip or
              cancel anytime from your account.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
