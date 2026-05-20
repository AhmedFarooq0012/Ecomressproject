"use client";
import { useState, useEffect } from "react";

interface Product {
    _id: string;
    name: string;
    description: string;
    stock: number;
    totalItem: number;
    category: string;
    image: string;
    price: number;
    createdAt?: string;
    updatedAt?: string;
}

// 1. Explicitly defined the prop interface type to clear the TS error
interface ProductManagerProps {
    searchQuery: string;
}

export default function ProductManager({ searchQuery }: ProductManagerProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // View management status ("list" | "create" | "edit")
    const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Categories validation arrays list
    const availableCategories = ["bag", "pen", "watch", "furniture", "electronics", "clothing"];

    // Multi-form management framework state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        stock: 50,
        totalItem: 50,
        category: "bag",
        image: "",
        price: 0
    });

    useEffect(() => {
        fetchAdminProducts();
    }, []);

    const fetchAdminProducts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/admin/products", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.products) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error("Failed to load inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("⚠️ File Size Warning: Base64 data string boht barri ho sakti hai. Please under 2MB image use karein.");
            return;
        }

        const fileReaderInstance = new FileReader();
        fileReaderInstance.onloadend = () => {
            const convertedBase64Result = fileReaderInstance.result as string;
            setFormData((prev) => ({ ...prev, image: convertedBase64Result }));
        };

        fileReaderInstance.readAsDataURL(file);
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) {
            alert("Error: Please pehle item ki image file gallery se upload kijiye.");
            return;
        }

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    totalItem: Number(formData.stock),
                    stock: Number(formData.stock),
                    price: Number(formData.price)
                })
            });

            const data = await res.json();
            if (data.success || res.ok) {
                alert("🎉 Product successfully published with encoded base64 serialization asset.");
                setViewMode("list");
                await fetchAdminProducts();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/admin/products/${selectedProduct._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    price: Number(formData.price),
                    stock: Number(formData.stock)
                })
            });

            if (res.ok) {
                alert("⚙️ Listing updated successfully.");
                setViewMode("list");
                await fetchAdminProducts();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to scrub this live listing entry?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/admin/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setProducts((prev) => prev.filter((p) => p._id !== id));
                alert("🗑️ Listing purged.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const triggerEditMode = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            stock: product.stock,
            totalItem: product.totalItem,
            category: product.category,
            image: product.image,
            price: product.price
        });
        setViewMode("edit");
    };

    const triggerCreateMode = () => {
        setFormData({ name: "", description: "", stock: 50, totalItem: 50, category: "bag", image: "", price: 0 });
        setViewMode("create");
    };

    // 2. Added client-side real-time query string filtration array
    const filteredProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        return (
            product.name?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="bg-white p-12 text-center text-sm font-semibold text-gray-400">
                Syncing admin workspace ledger context data...
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">

            {/* SECTION VIEW BAR CONTROLS TOGGLE BANNER */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Inventory Workspace</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Base64 file generation streams aur dynamic categorizations setup kijiye.</p>
                </div>
                {viewMode === "list" ? (
                    <button onClick={triggerCreateMode} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs transition">
                        ＋ Add New Product
                    </button>
                ) : (
                    <button onClick={() => setViewMode("list")} className="border text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-gray-50 transition">
                        ← Back To Inventory List
                    </button>
                )}
            </div>

            {/* VIEW NODE A: LEDGER TABLE VIEW LIST SYSTEM */}
            {viewMode === "list" && (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-sm divide-y divide-gray-100">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Product Asset Info</th>
                                <th className="p-4">Category Node</th>
                                <th className="p-4">Unit Price</th>
                                <th className="p-4">Stock Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                            {/* 3. Replaced master list with filteredProducts list mapping */}
                            {filteredProducts.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 border overflow-hidden shrink-0 flex items-center justify-center">
                                            <img
                                                src={p.image && p.image.startsWith("data:image") ? p.image : "https://unsplash.com"}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="max-w-xs">
                                            <p className="text-gray-900 font-bold truncate">{p.name}</p>
                                            <p className="text-xs text-gray-400 font-normal truncate mt-0.5">{p.description}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider">{p.category}</span>
                                    </td>
                                    <td className="p-4 text-gray-900 font-extrabold">${p.price}</td>
                                    <td className="p-4">
                                        <p className="text-gray-900">{p.stock} <span className="text-xs font-normal text-gray-400">/ {p.totalItem || p.stock} left</span></p>
                                    </td>
                                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => triggerEditMode(p)} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">Edit</button>
                                        <button onClick={() => handleDeleteProduct(p._id)} className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400 text-xs font-medium">Koi items aapki search query se match nahi hue.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* VIEW NODE B: CREATOR INPUT FORM PANEL BOX */}
            {viewMode === "create" && (
                <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-bold text-gray-500 max-w-xl">
                    <div>
                        <label className="block uppercase tracking-wider mb-1">Product Title</label>
                        <input type="text" required placeholder="Premium Leather Backpack product 3" className="w-full border rounded-lg p-2.5 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block uppercase tracking-wider mb-1">Detailed Spec Summary</label>
                        <textarea required rows={3} placeholder="Water-resistant daily commuter bag..." className="w-full border rounded-lg p-2.5 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block uppercase tracking-wider mb-1">Base Price Valuation ($)</label>
                            <input type="number" required placeholder="120" className="w-full border rounded-lg p-2.5 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block uppercase tracking-wider mb-1">Stock Count Volume</label>
                            <input type="number" required placeholder="50" className="w-full border rounded-lg p-2.5 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block uppercase tracking-wider mb-1 text-indigo-600">Category Select Group</label>
                            <select
                                className="w-full border bg-white rounded-lg p-2.5 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {availableCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block uppercase tracking-wider mb-1 text-indigo-600">Gallery Image File Upload</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileChange}
                                className="w-full border rounded-lg p-2 font-medium text-gray-500 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    {formData.image && (
                        <div className="mt-2 space-y-1">
                            <span className="text-[10px] text-gray-400 block uppercase tracking-wide">Base64 Image Pre-visualizer:</span>
                            <div className="w-24 h-24 border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                                <img src={formData.image} className="w-full h-full object-cover" alt="preview" />
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={actionLoading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-xs transition w-full sm:w-auto">
                        {actionLoading ? "Uploading Serialization Parameters..." : "📦 Upload Live Product"}
                    </button>
                </form>
            )}

            {/* VIEW NODE C: ADJUST VALUES EDIT PARAMETERS */}
            {viewMode === "edit" && selectedProduct && (
                <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs font-bold text-gray-500 max-w-md bg-gray-50/50 border p-5 rounded-xl">
                    <div className="mb-2">
                        <span className="text-[10px] text-gray-400 tracking-widest font-black uppercase">Editing Secure Node:</span>
                        <h4 className="text-sm font-black text-gray-900 mt-0.5">{selectedProduct.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                        <div>
                            <label className="block uppercase tracking-wider mb-1 text-indigo-600">Adjust Valuation ($)</label>
                            <input type="number" required placeholder="145" className="w-full border border-indigo-200 bg-white rounded-lg p-2.5 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block uppercase tracking-wider mb-1 text-indigo-600">Modify Live Stock Available</label>
                            <input type="number" required placeholder="35" className="w-full border border-indigo-200 bg-white rounded-lg p-2.5 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                        <button type="button" onClick={() => setViewMode("list")} className="px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                            {actionLoading ? "Saving Changes..." : "✓ Apply Changes"}
                        </button>
                    </div>
                </form>
            )}

        </div>
    );
}
