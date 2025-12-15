"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAuth } from "../../_utils/auth-context";
import { getCartItems } from "../../_services/cart-service";
import { clearCart, createOrder } from "../../_services/orders-service";

export default function CheckoutPage() {
  const { user } = useUserAuth();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [placing, setPlacing] = useState(false);
  const [placeErr, setPlaceErr] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      return sum + Number(it.price || 0) * Number(it.quantity || 0);
    }, 0);
  }, [items]);

  useEffect(() => {
    let mounted = true;

    async function load() {
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

    if (user?.uid) load();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlaceErr("");

    if (items.length === 0) {
      setPlaceErr("Cart is empty");
      return;
    }

    if (!name.trim() || !address.trim() || !phone.trim()) {
      setPlaceErr("Missing shipping fields");
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
      });

      await clearCart(user.uid);

      router.replace("/orders");
    } catch (e) {
      setPlaceErr(e?.message || "Failed to place order");
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

            <form onSubmit={handlePlaceOrder} className="mt-3 space-y-3">
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

              {placeErr && <p className="text-red-600 text-sm">{placeErr}</p>}

              <button
                type="submit"
                disabled={placing}
                className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-60"
              >
                {placing ? "Placing order..." : "Place order"}
              </button>
            </form>

            <p className="mt-3 text-xs text-gray-500">
              This is a demo checkout. Do not enter real sensitive data.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
