"use client";

import Link from "next/link";

export default function ProductCard({ product }) {
  if (!product) return null;

  const { id, title, price, image, category } = product;

  return (
    <article className="border rounded-lg p-3 flex flex-col gap-3">
      <Link href={`/store/${id}`} className="block">
        <div className="aspect-square w-full flex items-center justify-center bg-white overflow-hidden rounded">
          <img
            src={image}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="mt-3">
          <div className="text-sm text-gray-600">{category}</div>
          <h3 className="font-medium line-clamp-2">{title}</h3>
          <p className="mt-1 font-semibold">${Number(price).toFixed(2)}</p>
        </div>
      </Link>

      <div className="mt-auto flex gap-2">
        <Link
          href={`/store/${id}`}
          className="w-full text-center border rounded px-3 py-2"
        >
          View
        </Link>
      </div>
    </article>
  );
}
