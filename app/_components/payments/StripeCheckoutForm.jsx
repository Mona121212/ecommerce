"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export default function StripeCheckoutForm({ onPaid, disabled }) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        setSubmitting(false);
        return;
      }

      await onPaid?.(result.paymentIntent?.id);
    } catch (e2) {
      setError(e2?.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={disabled || submitting || !stripe || !elements}
        className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-60"
      >
        {submitting ? "Processing..." : "Pay"}
      </button>
    </form>
  );
}
