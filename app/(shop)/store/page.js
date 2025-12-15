"use client";

import Link from "next/link";
import { useUserAuth } from "../../_utils/auth-context";

export default function StorePage() {
  const { user, firebaseSignOut } = useUserAuth();

  return (
    <main className="p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Store</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        <div className="flex gap-3">
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

      <section className="mt-6">
        <p>Next step: load products from external API.</p>
      </section>
    </main>
  );
}
