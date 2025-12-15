"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserAuth } from "../../_utils/auth-context";

export default function AuthGate({ children }) {
  const { user, authLoading } = useUserAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/store");
      router.replace(`/login?next=${next}`);
    }
  }, [user, authLoading, router, pathname]);

  if (authLoading) return <main className="p-6">Loading...</main>;
  if (!user) return <main className="p-6">Redirecting...</main>;

  return children;
}
