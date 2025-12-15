"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserAuth } from "../../_utils/auth-context";
import { getOrders } from "../../_services/orders-service";

function formatDate(ms) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "";
  }
}

export default function OrdersPage() {
  const { user } = useUserAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        const data = await getOrders(user.uid);
        if (!mounted) return;
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load orders");
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

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading orders...</p>
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
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link className="underline" href="/store">
          Back to store
        </Link>
      </header>

      {orders.length === 0 ? (
        <div className="mt-6">
          <p className="text-gray-700">No orders yet.</p>
          <Link className="underline" href="/store">
            Shop now
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((o) => (
            <article key={o.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-600">
                    {formatDate(o.createdAt)}
                  </div>
                  <div className="font-semibold">Status: {o.status}</div>
                </div>
                <div className="text-lg font-semibold">
                  ${Number(o.total || 0).toFixed(2)}
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {(o.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 line-clamp-1">{it.title}</div>
                    <div className="text-sm text-gray-600">
                      ${Number(it.price || 0).toFixed(2)} × {it.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
