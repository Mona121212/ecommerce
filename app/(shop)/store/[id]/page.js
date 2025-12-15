"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "../../../_services/products-service";
import { addToCart } from "../../../_services/cart-service";
import { useUserAuth } from "../../../_utils/auth-context";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUserAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState("");

  const productId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        const data = await getProductById(productId);
        if (!mounted) return;
        setProduct(data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load product");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    if (Number.isFinite(productId) && productId > 0) load();
    else {
      setLoading(false);
      setErr("Invalid product id");
    }

    return () => {
      mounted = false;
    };
  }, [productId]);

  async function handleAdd() {
    if (!user) return;
    setAdding(true);
    setAddErr("");

    try {
      await addToCart(user.uid, product, qty);
      router.push("/cart");
    } catch (e) {
      setAddErr(e?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading...</p>
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
      <div className="flex items-center justify-between">
        <Link className="underline" href="/store">
          Back
        </Link>
        <Link className="underline" href="/cart">
          Cart
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-[420px] object-contain"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-600">{product.category}</div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-xl font-semibold">
            ${Number(product.price).toFixed(2)}
          </p>
          <p className="text-gray-700">{product.description}</p>

          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm text-gray-600">Qty</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="border rounded p-2 w-24"
            />
          </div>

          {addErr && <p className="text-red-600 text-sm">{addErr}</p>}

          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !product}
            className="mt-2 bg-black text-white rounded px-4 py-2 disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </main>
  );
}
