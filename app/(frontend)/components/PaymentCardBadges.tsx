/**
 * Visa / Mastercard acceptance marks shown at checkout, so customers (and the
 * acquiring bank) can see which cards the payment is processed with. Rendered
 * as small white "card" chips that stay legible on the dark modals.
 */
export default function PaymentCardBadges({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className}`}
      aria-label="We accept Visa and Mastercard"
    >
      <VisaBadge />
      <MastercardBadge />
    </div>
  );
}

function VisaBadge() {
  return (
    <span className="flex h-7 w-11 items-center justify-center rounded-[4px] bg-white shadow-sm">
      <svg viewBox="0 0 48 16" height="11" role="img" aria-label="Visa">
        <text
          x="0"
          y="13"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="15"
          fontWeight="700"
          fontStyle="italic"
          letterSpacing="0.5"
          fill="#1434CB"
        >
          VISA
        </text>
      </svg>
    </span>
  );
}

function MastercardBadge() {
  return (
    <span className="flex h-7 w-11 items-center justify-center rounded-[4px] bg-white shadow-sm">
      <svg viewBox="0 0 36 22" height="16" role="img" aria-label="Mastercard">
        <circle cx="14" cy="11" r="9" fill="#EB001B" />
        <circle cx="22" cy="11" r="9" fill="#F79E1B" />
        <path
          d="M18 4.2a9 9 0 0 0 0 13.6 9 9 0 0 0 0-13.6z"
          fill="#FF5F00"
        />
      </svg>
    </span>
  );
}
