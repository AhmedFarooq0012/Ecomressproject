"use client";

import Navbar from "@/components/navbar";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        image: "",
        category: "",
        stock: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication token not found. Please log in again.");
            setLoading(false);
            router.push("/login");
            return;
        }

        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price), // Convert price to number
                    stock: parseInt(formData.stock, 10), // Convert stock to number
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to add product.");
            }

            alert("Product added successfully!");
            setFormData({ name: "", price: "", image: "", category: "", stock: "" }); // Clear form
            router.push("/dashboard/admin"); // Redirect to admin dashboard or product list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 p-6">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium border border-red-200 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
                            <input type="url" id="image" name="image" value={formData.image} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                            {loading ? "Adding Product..." : "Add Product"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}