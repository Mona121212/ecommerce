"use client";

export default function Error({ error, reset }) {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-700">{error?.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 border rounded px-3 py-2"
      >
        Try again
      </button>
    </main>
  );
}
