"use client";
import { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import OrderManager from "./OrderManager";
import ProductManager from "./ProductManager";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

    // Shared search state for global filter
    const [searchQuery, setSearchQuery] = useState("");

    const handleAdminLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminNavbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleAdminLogout}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery} // Passed search states here
            />

            <main className="flex-1 max-w-7xl w-full mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Control Panel</h1>
                <div className="w-full">
                    {/* Pass query parameter to product manager */}
                    {activeTab === "products" && <ProductManager searchQuery={searchQuery} />}
                    {activeTab === "orders" && <OrderManager />}
                </div>
            </main>
        </div>
    );
}
