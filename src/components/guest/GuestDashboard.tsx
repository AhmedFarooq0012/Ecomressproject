"use client";
import { useState } from "react";
import GuestNavbar from "./GuestNavbar";
import ProductCatalog from "../customer/ProductCatalog"; // Path points to folder verified on image
import ShoppingCart from "../customer/ShoppingCart";

export default function GuestDashboard() {
    const [activeTab, setActiveTab] = useState<"catalog" | "cart" | "orders">("catalog");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-800">
            <GuestNavbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto p-6 transition-all duration-200">
                <div className="w-full">
                    {activeTab === "catalog" && <ProductCatalog searchQuery={searchQuery} />}
                    {activeTab === "cart" && <ShoppingCart />}
                </div>
            </main>
        </div>
    );
}
