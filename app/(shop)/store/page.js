"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserAuth } from "../../_utils/auth-context";
import { getProducts } from "../../_services/products-service";
import ProductGrid from "../../_components/products/ProductGrid";

export default function StorePage() {
  const { user, firebaseSignOut } = useUserAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        const data = await getProducts();
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load products");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Store</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        <div className="flex gap-3 items-center">
          <Link className="underline" href="/cart">
            Cart
          </Link>
          <Link className="underline" href="/orders">
            Orders
          </Link>
          <button
            onClick={firebaseSignOut}
            className="bg-black text-white rounded px-3 py-1"
            type="button"
          >
            Sign Out
          </button>
        </div>
      </header>

      {loading && <p className="mt-6">Loading products...</p>}

      {!loading && err && (
        <div className="mt-6 border rounded p-3">
          <p className="text-red-600">{err}</p>
          <button
            type="button"
            onClick={() => location.reload()}
            className="mt-3 border rounded px-3 py-2"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !err && <ProductGrid products={products} />}
    </main>
  );
}
