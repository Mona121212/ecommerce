import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Home</h1>
      <div className="mt-4 flex gap-3">
        <Link className="underline" href="/store">
          Go to Store
        </Link>
        <Link className="underline" href="/login">
          Login
        </Link>
      </div>
    </main>
  );
}
