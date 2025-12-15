"use client";

export default function CartItemRow({ item, onQtyChange, onRemove }) {
  if (!item) return null;

  const { title, price, image, quantity } = item;
  const lineTotal = Number(price || 0) * Number(quantity || 0);

  return (
    <div className="border rounded-lg p-3 flex gap-3 items-center">
      <div className="w-20 h-20 flex items-center justify-center bg-white rounded overflow-hidden">
        <img src={image} alt={title} className="max-h-full object-contain" />
      </div>

      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600">${Number(price).toFixed(2)}</div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => onQtyChange?.(Number(e.target.value))}
          className="border rounded p-2 w-20"
        />
        <div className="w-28 text-right font-semibold">
          ${Number(lineTotal).toFixed(2)}
        </div>
        <button
          type="button"
          onClick={() => onRemove?.()}
          className="border rounded px-3 py-2"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
