"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { useUserAuth } from "../../_utils/auth-context";
import { getCartItems } from "../../_services/cart-service";
import { clearCart, createOrder } from "../../_services/orders-service";
import StripeCheckoutForm from "../../_components/payments/StripeCheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutPage() {
  const { user } = useUserAuth();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [clientSecret, setClientSecret] = useState("");
  const [piErr, setPiErr] = useState("");
  const [placing, setPlacing] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
      0
    );
  }, [items]);

  const amountInCents = useMemo(() => {
    return Math.round(subtotal * 100);
  }, [subtotal]);

  useEffect(() => {
    let mounted = true;

    async function loadCart() {
      try {
        setLoading(true);
        setErr("");
        const data = await getCartItems(user.uid);
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load cart");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    if (user?.uid) loadCart();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    let mounted = true;

    async function createPI() {
      setPiErr("");
      setClientSecret("");

      if (!user?.uid) return;
      if (items.length === 0) return;

      try {
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountInCents }),
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Failed to create payment intent");
        if (!mounted) return;

        setClientSecret(data.clientSecret);
      } catch (e) {
        if (!mounted) return;
        setPiErr(e?.message || "Failed to create payment intent");
      }
    }

    createPI();
    return () => {
      mounted = false;
    };
  }, [user?.uid, items.length, amountInCents]);

  async function handlePaid(paymentIntentId) {
    if (!name.trim() || !address.trim() || !phone.trim()) {
      alert("Missing shipping fields");
      return;
    }

    setPlacing(true);
    try {
      const orderItems = items.map((it) => ({
        productId: Number(it.productId),
        title: String(it.title ?? ""),
        price: Number(it.price ?? 0),
        image: String(it.image ?? ""),
        quantity: Number(it.quantity ?? 1),
      }));

      await createOrder(user.uid, {
        total: subtotal,
        items: orderItems,
        shipping: {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
        },
        payment: {
          provider: "stripe",
          paymentIntentId: paymentIntentId || null,
        },
        status: "paid",
      });

      await clearCart(user.uid);
      router.replace("/orders");
    } catch (e) {
      alert(e?.message || "Failed to finalize order");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading checkout...</p>
      </main>
    );
  }

  if (err) {
    return (
      <main className="p-6">
        <p className="text-red-600">{err}</p>
        <Link className="underline" href="/cart">
          Back to cart
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <Link className="underline" href="/cart">
          Back to cart
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-700">Your cart is empty.</p>
          <Link className="underline" href="/store">
            Go shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">Order summary</h2>

            <div className="mt-3 flex flex-col gap-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center bg-white border rounded overflow-hidden">
                    <img
                      src={it.image}
                      alt={it.title}
                      className="max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{it.title}</div>
                    <div className="text-sm text-gray-600">
                      ${Number(it.price).toFixed(2)} × {it.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    ${(Number(it.price) * Number(it.quantity)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Total</div>
              <div className="text-lg font-semibold">
                ${subtotal.toFixed(2)}
              </div>
            </div>
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">Shipping</h2>

            <div className="mt-3 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full border rounded p-2"
                required
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="w-full border rounded p-2"
                required
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full border rounded p-2"
                required
              />
            </div>

            <div className="mt-5">
              <h3 className="text-md font-semibold">Payment</h3>

              {piErr && <p className="mt-2 text-red-600 text-sm">{piErr}</p>}

              {!piErr && !clientSecret && (
                <p className="mt-2">Initializing payment...</p>
              )}

              {clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: { theme: "stripe" },
                  }}
                >
                  <div className="mt-3">
                    <StripeCheckoutForm
                      onPaid={handlePaid}
                      disabled={placing}
                    />
                  </div>
                </Elements>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Test mode only. Use Stripe test card numbers.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
