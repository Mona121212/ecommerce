"use client";

import CartItemRow from "./CartItemRow";

export default function CartList({ items = [], onQtyChange, onRemove }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      {items.map((it) => (
        <CartItemRow
          key={it.id}
          item={it}
          onQtyChange={(qty) => onQtyChange?.(it, qty)}
          onRemove={() => onRemove?.(it)}
        />
      ))}
    </div>
  );
}
