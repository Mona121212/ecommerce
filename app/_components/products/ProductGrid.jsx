"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = Array.isArray(products) ? [...products] : [];

    if (q) {
      list = list.filter((p) => {
        const title = String(p?.title ?? "").toLowerCase();
        const category = String(p?.category ?? "").toLowerCase();
        return title.includes(q) || category.includes(q);
      });
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "title-asc") {
      list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }

    return list;
  }, [products, query, sortBy]);

  return (
    <section className="mt-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or category"
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded p-2"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title-asc">Title: A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-gray-600">No products found.</p>
      )}
    </section>
  );
}
