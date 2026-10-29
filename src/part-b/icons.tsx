export function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="var(--color-star)"
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  );
}

export function RadioIcon({ checked }: { checked: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="9.25"
        fill="#fff"
        stroke={checked ? "var(--color-brand)" : "var(--color-radio-off)"}
        strokeWidth="1.5"
      />
      {checked && <circle cx="10" cy="10" r="5" fill="var(--color-brand)" />}
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.55 8.5 6.78 12 13.25 4.5"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.4" fill="none" stroke="var(--color-brand)" strokeWidth="1.2" />
      <path
        d="M5.1 8.2 7.1 10.1 10.9 6.1"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden="true">
      <path
        d="M1 1 4 4 7 1"
        fill="none"
        stroke="var(--color-text-body)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6h8" stroke="var(--color-text-body)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6h8M6 2v8" stroke="var(--color-text-body)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
