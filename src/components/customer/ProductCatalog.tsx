"use client";
import { useState, useEffect } from "react";

interface Product {
    _id: string;
    name: string;
    description: string;
    stock: number;
    totalItem: number;
    category: string;
    image: string; // Dynamic values: Standard URLs or Base64 Strings
    price: number;
}

interface ProductCatalogProps {
    searchQuery: string;
}

export default function ProductCatalog({ searchQuery }: ProductCatalogProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

    // Detail Popup Modal State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Fetch product list data on component load
    useEffect(() => {
        const fetchCatalogProducts = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/admin/products");
                const data = await res.json();
                if (data.success && data.products) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error("Failed to load catalog products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalogProducts();
    }, []);

    // Handle Cart Submission with JWT Authentication (POST /api/cart)
    const handleAddToCart = async (productId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); // Prevents opening the modal popup when clicking the button
        setAddingToCartId(productId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ productId, quantity: 1 }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update cart records.");
            }

            if (data.success) {
                alert("Success! Item added to your shopping bag safely.");
            }
        } catch (error: any) {
            console.error("Cart transaction failed:", error);
            alert(`Cart Error: ${error.message || "Authorization failed. Please log in again."}`);
        } finally {
            setAddingToCartId(null);
        }
    };

    // ✅ ROBUST BASE64 RESOLVER UTILITY
    // This helper string matches data patterns to clean data or inject safe data URLs natively
    const renderProductImage = (imageStr: string) => {
        if (!imageStr) {
            return "https://unsplash.com"; // Fallback image
        }

        // 1. If it's a standard web link URL, pass it back directly
        if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
            // Avoid placeholder crash chains pointing to localhost roots
            if (imageStr.includes("localhost")) {
                return "https://unsplash.com";
            }
            return imageStr;
        }

        // 2. If it's a Base64 string that already contains a standard prefix, use it
        if (imageStr.startsWith("data:image")) {
            return imageStr;
        }

        // 3. If it's a raw base64 string without a format prefix, append a safe baseline JPEG type string header
        return `data:image/jpeg;base64,${imageStr}`;
    };

    // Filter products array based on navbar input state before processing groups
    const filteredProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        const matchName = product.name?.toLowerCase().includes(query);
        const matchCategory = product.category?.toLowerCase().includes(query);
        const matchDesc = product.description?.toLowerCase().includes(query);

        return matchName || matchCategory || matchDesc;
    });

    // Groups filtered array values dynamically by category key labels
    const groupedProducts = filteredProducts.reduce((groups: { [key: string]: Product[] }, product) => {
        const category = product.category || "Uncategorized";
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(product);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm font-medium">Synchronizing live market inventory collections...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {Object.keys(groupedProducts).map((categoryName) => (
                <div key={categoryName} className="space-y-6">

                    {/* Category Header Title Banner */}
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-3">
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 capitalize">
                            {categoryName} Collections
                        </h2>
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {groupedProducts[categoryName].length} items
                        </span>
                    </div>

                    {/* Grid Layout Container */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {groupedProducts[categoryName].map((product) => (
                            <div
                                key={product._id}
                                onClick={() => setSelectedProduct(product)}
                                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer group flex flex-col"
                            >
                                {/* Product Image Panel Container */}
                                <div className="h-56 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                                    <img
                                        src={renderProductImage(product.image)} // ✅ Uses base64 image renderer
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs font-black text-gray-900 text-sm px-3 py-1 rounded-full shadow-xs">
                                        ${product.price}
                                    </div>
                                </div>

                                {/* Card Main Body Content Details */}
                                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                            {product.name}
                                        </h3>
                                    </div>

                                    {/* Add To Cart Button */}
                                    <button
                                        onClick={(e) => handleAddToCart(product._id, e)}
                                        disabled={addingToCartId !== null}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                                    >
                                        {addingToCartId === product._id ? (
                                            <>
                                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            "🛒 Add To Cart"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {Object.keys(groupedProducts).length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-400 text-base">Aapki search query ke mutabik koi product nahi mila.</p>
                </div>
            )}

            {/* Pop-Up Modal Container View Layout */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedProduct(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border transform transition-all animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Image Section Header */}
                        <div className="h-64 bg-gray-50 relative flex items-center justify-center border-b">
                            <img
                                src={renderProductImage(selectedProduct.image)} // ✅ Uses base64 image renderer here too
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body Parameters */}
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full">
                                        {selectedProduct.category}
                                    </span>
                                    <h3 className="text-xl font-extrabold text-gray-900 mt-1.5">{selectedProduct.name}</h3>
                                </div>
                                <div className="text-2xl font-black text-indigo-600">${selectedProduct.price}</div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Item Summary Description</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 p-2.5 rounded-lg border">
                                <span className={`w-2 h-2 rounded-full ${selectedProduct.stock > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                                <span>Available Units left in store: <strong className="text-gray-900">{selectedProduct.stock} items</strong></span>
                            </div>

                            {/* Action Operations Area */}
                            <div className="pt-4 flex items-center gap-3 border-t">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-1/3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-xl transition text-center"
                                >
                                    Close View
                                </button>
                                <button
                                    onClick={() => {
                                        handleAddToCart(selectedProduct._id);
                                        setSelectedProduct(null);
                                    }}
                                    disabled={addingToCartId !== null}
                                    className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl transition shadow-sm text-center"
                                >
                                    🚀 Grab Item Into Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
