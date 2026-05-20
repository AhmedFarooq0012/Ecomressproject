"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // ✅ Hits your exact login API endpoint
            const res = await fetch("/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Invalid email or password identity combinations.");
            }

            // Safe fallback value injection agar backend role property na bheyjay
            const fetchedRole = data.user?.role || "Guest";

            // Store the signed JWT token and user metadata safely in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", fetchedRole);

            // ✅ CLEAN AND SECURE EDGE-CASE ROUTING LOGIC
            if (fetchedRole === "Admin") {
                router.push("/dashboard/admin");
            } else if (fetchedRole === "Customer") {
                router.push("/dashboard/customer");
            } else {
                // Agar role 'Guest', unassigned, khali ya kuch aur ho toh dynamic path protection fallback
                router.push("/dashboard/guest");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to account</h2>
                    <p className="mt-2 text-sm text-gray-600">Welcome back! Please enter your details.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium border border-red-200">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-600 mt-4">
                    Don't have an account yet?{" "}
                    <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign up for free
                    </Link>
                </div>
            </div>
        </div>
    );
}
