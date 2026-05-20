"use client";
import { useState } from "react";
import CustomerNavbar from "./CustomerNavbar";
import ProductCatalog from "./ProductCatalog";
import ShoppingCart from "./ShoppingCart";
import OrderHistory from "./OrderHistory";

export default function CustomerDashboard() {
    const [activeTab, setActiveTab] = useState<"catalog" | "cart" | "orders">("catalog");
    const [searchQuery, setSearchQuery] = useState("");

    // REAL LOGOUT FUNCTION IMPLEMENTATION
    const handleLogoutAction = () => {
        // 1. Storage se JWT token aur user session values ko remove karein
        localStorage.removeItem("token");
        localStorage.removeItem("user"); // Agar aap user data save karte hain

        // 2. Client side storage clear confirm karne ke liye clean up confirm message
        console.log("Session removed. Redirecting...");

        // 3. User ko direct login route standard parameters par push karein
        window.location.href = "/login"; // change "/login" to your exact login URL path
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <CustomerNavbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogoutAction} // Yahan hamara real action bind ho gaya
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto p-6">
                <div className="w-full">
                    {activeTab === "catalog" && <ProductCatalog searchQuery={searchQuery} />}
                    {activeTab === "orders" && <OrderHistory />}
                    {activeTab === "cart" && <ShoppingCart />}
                </div>
            </main>
        </div>
    );
}
