"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  useEffect(() => {
    // Client memory browser session values trace kijiye
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    // 1. FIRST TIME/UNAUTHORIZED VISITOR LOCK: Force redirect direct to /guest router path
    if (!token) {
      router.replace("/guest");
      return;
    }
    // 2. Verified active authorized profiles gatekeepers redirections
    if (userRole === "Admin") {
      router.replace("/dashboard/admin");
    } else if (userRole === "Customer") {
      router.replace("/dashboard/customer");
    } else {
      // Safe fallback edge case setup
      router.replace("/guest");
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col justify-center items-center gap-3 font-sans">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-zinc-400 text-sm font-semibold tracking-wide">
          Welcome to Marketplace! Loading safe configuration pipelines...
        </p>
      </div>
    );
  }
  return null;
}
