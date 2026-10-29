# Natura Wellness frontend test

Natura Wellness is a fictional brand made up for this test. The full brief is in `INSTRUCTIONS.md`.

```
npm install
npm run dev
```

- **Part A:** `src/part-a/SubscriptionCard.tsx`. Open `/?part=a&fixture=active`. The mock API is in `src/api/`; switch cases with `?fixture=active|paused|cancelled|error` and force the "changed elsewhere" error with `&conflict=always`.
- **Part B:** `src/part-b/BuyBox.tsx`. Open `/?part=b`. Match `public/reference/buy-box.png`, which is a 2x screenshot of a 1200px-wide browser window. Copy is in `src/part-b/copy.ts`; Fraunces and Inter are loaded in `index.html`.

You can add any libraries you like.

## Part A: how the screen is organised

Two panels: **Your subscription** (status, products with image and quantity, delivery frequency, discount) and **Next shipment** (date and amount first, then the lines, the charge details and the skip). From 768px they sit side by side, the subscription on the left and the next shipment on the right. On a phone the next shipment comes first. The order is decided in the DOM with a synchronous `useMediaQuery`, not with CSS `order`, so keyboard and screen reader order match what is on screen.

Paused and cancelled subscriptions never offer a skip. The next shipment panel says why there is none (paused until, or cancelled on). Skipping a shipment always asks for confirmation, shows the old and the new charge date, and is never retried automatically after a rejection.

Two actions on the screen are placeholders. They do not call the API and do not change anything; they open a dialog saying the feature isn't available yet:

- **Cancel subscription** (active and paused subscriptions).
- **Skipping more than one shipment** (the 1 / 2 / 3 selector; 1 is the real skip).

They exist because customers should not have to come back every month to skip the next shipment, and because cancelling is something people look for on this screen. The API has no endpoint for either, hence the suggestions below.

## API improvement suggestions

1. **Cancel a subscription.** An endpoint that cancels and returns the updated subscription with the date it takes effect, using `expectedUpdatedAt` like the skip does so a stale screen cannot cancel by accident.
2. **Skip several shipments in one call.** A `count` (or a "skip until" date) on the skip call, keeping `expectedUpdatedAt`, and returning the new `nextChargeAt`. Today the screen can only skip one shipment at a time.
3. **Resume a paused subscription and reactivate a cancelled one.** The data model has `pausedUntil` and `cancelledAt`, but no way to act on them, so a paused or cancelled customer cannot do anything from this screen.
4. **Items per shipment.** The API returns one list of items. The next shipment panel and the subscription panel therefore show the same products. A `nextShipment.items` (with its own quantities and prices) would let them differ, for example for a one-off add-on.
5. **Error bodies.** Rejections only carry a status and a short message. A stable error `code` (for example `subscription_changed`, `not_active`) would let the screen choose its wording without relying on the HTTP status alone.
