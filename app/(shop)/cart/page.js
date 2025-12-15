"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUserAuth } from "../../_utils/auth-context";
import {
  getCartItems,
  removeCartItem,
  updateCartItemQty,
} from "../../_services/cart-service";
import CartList from "../../_components/cart/CartList";

export default function CartPage() {
  const { user } = useUserAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const line = Number(it.price || 0) * Number(it.quantity || 0);
      return sum + line;
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

  async function handleQtyChange(item, qty) {
    const nextQty = Number(qty);
    if (!Number.isFinite(nextQty) || nextQty < 1) return;

    const prev = items;
    setItems((cur) =>
      cur.map((it) => (it.id === item.id ? { ...it, quantity: nextQty } : it))
    );

    try {
      await updateCartItemQty(user.uid, item.id, nextQty);
    } catch (e) {
      setItems(prev);
      alert(e?.message || "Failed to update quantity");
    }
  }

  async function handleRemove(item) {
    const prev = items;
    setItems((cur) => cur.filter((it) => it.id !== item.id));

    try {
      await removeCartItem(user.uid, item.id);
    } catch (e) {
      setItems(prev);
      alert(e?.message || "Failed to remove item");
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading cart...</p>
      </main>
    );
  }

  if (err) {
    return (
      <main className="p-6">
        <p className="text-red-600">{err}</p>
        <Link className="underline" href="/store">
          Back to store
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <Link className="underline" href="/store">
          Continue shopping
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="mt-6 text-gray-700">Your cart is empty.</p>
      ) : (
        <>
          <CartList
            items={items}
            onQtyChange={handleQtyChange}
            onRemove={handleRemove}
          />

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="text-lg font-semibold">Subtotal</div>
            <div className="text-lg font-semibold">${subtotal.toFixed(2)}</div>
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              href="/checkout"
              className="bg-black text-white rounded px-4 py-2"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
