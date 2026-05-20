"use client";
import { useState, useEffect } from "react";

interface CartItem {
    _id: string;
    productId: {
        _id: string;
        name: string;
        stock: number;
        category: string;
        image: string;
        price: number;
    };
    userId: string;
    quantity: number;
}

interface Address {
    _id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export default function ShoppingCart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");

    // Processing state variables
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Address Modal Control State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

    // New Address Parameters Form State
    const [newAddress, setNewAddress] = useState({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Pakistan",
        isDefault: true
    });

    useEffect(() => {
        fetchCartAndAddresses();
    }, []);

    const fetchCartAndAddresses = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { "Authorization": `Bearer ${token}` };

            const [cartRes, addressRes] = await Promise.all([
                fetch("http://localhost:3000/api/cart", { headers }),
                fetch("http://localhost:3000/api/address", { headers })
            ]);

            const cartData = await cartRes.json();
            const addressData = await addressRes.json();

            if (cartData.success) setCartItems(cartData.cartItems || []);

            if (addressData.success && addressData.addresses) {
                setAddresses(addressData.addresses);
                const defaultAddr = addressData.addresses.find((a: Address) => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr._id);
                } else if (addressData.addresses.length > 0) {
                    setSelectedAddressId(addressData.addresses[0]._id);
                }
            }
        } catch (error) {
            console.error("Failed initializing data sequences:", error);
        } finally {
            setLoading(false);
        }
    };

    // Quantity controllers (POST /api/cart)
    const handleUpdateQuantity = async (productId: string, currentQty: number, adjustment: number, maxStock: number) => {
        const targetQuantity = currentQty + adjustment;
        if (targetQuantity < 1 || targetQuantity > maxStock) return;

        setActionLoadingId(productId);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: adjustment }),
            });
            if (res.ok) await fetchCartAndAddresses();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRemoveItem = async (cartItemId: string) => {
        if (!confirm("Kya aap is item ko cart se nikalna chahte hain?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/api/cart/${cartItemId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.ok) setCartItems((prev) => prev.filter((item) => item._id !== cartItemId));
        } catch (error) {
            console.error(error);
        }
    };

    // Naya address save karke automatic select karne ki logic
    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newAddress)
            });
            const data = await res.json();

            if (data.success && data.address) {
                setAddresses((prev) => [...prev, data.address]);
                setSelectedAddressId(data.address._id);
                setIsAddingNewAddress(false);
            }
        } catch (error) {
            console.error("Address generation processing crash:", error);
        }
    };

    // FINAL PLATFORM CHECKOUT OPERATION SYSTEM WITH AUTO-DELETE INTEGRATION
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert("Please choose or register a shipping target address point.");
            return;
        }

        setCheckoutLoading(true);
        try {
            const token = localStorage.getItem("token");

            // 1. Backend par order place karne ke liye API call hit karein
            const res = await fetch("http://localhost:3000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    addressId: selectedAddressId,
                    totalPrice: calculateSubtotal()
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {

                // 2. Kuch backends order ke baad cart khud khali nahi karte, toh hum safety ke liye har item par DELETE hit karenge
                await Promise.all(
                    cartItems.map((item) =>
                        fetch(`http://localhost:3000/api/cart/${item._id}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        })
                    )
                );

                alert("🎉 Mubarak ho! Aapka order successfully place ho chuka hai aur cart khali kar diya gaya hai.");

                // 3. UI states ko completely wipe aur modal ko close karein
                setCartItems([]);
                setIsAddressModalOpen(false);

            } else {
                alert(`Order processing issue: ${data.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Order processing failure:", error);
            alert("Order confirm karne me koi takneeki masla pesh aya hai.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0);
    };

    if (loading) {
        return (
            <div className="bg-white p-12 text-center text-sm font-semibold text-gray-400">
                Syncing basket totals data layers...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* SHOPPING CART OVERVIEW PANEL */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">🛒 Shopping Bag</h2>
                <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                        <div key={item._id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-4">
                                <img src={item.productId?.image || "https://placeholder.com"} className="w-12 h-12 object-cover rounded-lg border bg-gray-50 shrink-0" alt="" />
                                <div>
                                    <h4 className="text-gray-900 font-bold">{item.productId?.name}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">${item.productId?.price} each</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                <div className="flex items-center border rounded-xl bg-gray-50 p-1">
                                    <button type="button" onClick={() => handleUpdateQuantity(item.productId._id, item.quantity, -1, item.productId.stock)} disabled={item.quantity <= 1 || actionLoadingId !== null} className="w-7 h-7 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900">-</button>
                                    <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                                    <button type="button" onClick={() => handleUpdateQuantity(item.productId._id, item.quantity, 1, item.productId.stock)} disabled={item.quantity >= item.productId.stock || actionLoadingId !== null} className="w-7 h-7 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900">+</button>
                                </div>
                                <span className="font-bold text-gray-900 min-w-15 text-right">${item.productId?.price * item.quantity}</span>
                                <button onClick={() => handleRemoveItem(item._id)} className="text-rose-500 hover:text-rose-700">🗑️</button>
                            </div>
                        </div>
                    ))}
                    {cartItems.length === 0 && (
                        <p className="p-8 text-center text-gray-400 text-xs">Aapka shopping basket khali hai.</p>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="border-t border-dashed mt-6 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-xs text-gray-400">Total Payable Invoice Amount:</p>
                            <p className="text-2xl font-black text-indigo-600">${calculateSubtotal().toFixed(2)}</p>
                        </div>
                        <button
                            onClick={() => setIsAddressModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition"
                        >
                            🚀 Confirm Order Now
                        </button>
                    </div>
                )}
            </div>

            {/* POPUP MODAL: ADDRESS CONFIRMATION CONTAINER */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl border shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[85vh]">

                        {/* Modal Header */}
                        <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-900">
                                {isAddingNewAddress ? "📍 Add Delivery Address" : "📋 Confirm Shipping Destination"}
                            </h3>
                            <button
                                onClick={() => { setIsAddressModalOpen(false); setIsAddingNewAddress(false); }}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 flex-1 overflow-y-auto space-y-4">
                            {!isAddingNewAddress ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Delivery Point</p>
                                        <button
                                            onClick={() => setIsAddingNewAddress(true)}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                                        >
                                            ＋ Add New
                                        </button>
                                    </div>

                                    {addresses.map((addr) => (
                                        <label
                                            key={addr._id}
                                            className={`block p-3 border rounded-xl cursor-pointer text-xs font-semibold transition ${selectedAddressId === addr._id ? "border-indigo-600 bg-indigo-50/40" : "border-gray-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <input
                                                    type="radio"
                                                    name="checkout_modal_address"
                                                    checked={selectedAddressId === addr._id}
                                                    onChange={() => setSelectedAddressId(addr._id)}
                                                    className="mt-0.5 accent-indigo-600"
                                                />
                                                <div>
                                                    <p className="text-gray-900 font-bold">{addr.street}</p>
                                                    <p className="text-gray-500 mt-0.5">{addr.city}, {addr.state} - {addr.postalCode}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}

                                    {addresses.length === 0 && (
                                        <div className="text-center py-8 border border-dashed rounded-xl text-xs text-gray-400 font-medium">
                                            Koi address saved nahi hai. Please upar "Add New" par click karke save karein.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form id="modal-address-form" onSubmit={handleSaveAddress} className="space-y-3 text-xs font-bold text-gray-500">
                                    <div>
                                        <label className="block mb-1">Street Location / House Info</label>
                                        <input type="text" required placeholder="House 45, Street 12" className="w-full border rounded-lg p-2 font-medium text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block mb-1">City</label>
                                            <input type="text" required placeholder="Islamabad" className="w-full border rounded-lg p-2 font-medium text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block mb-1">State / Region</label>
                                            <input type="text" required placeholder="Punjab" className="w-full border rounded-lg p-2 font-medium text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1">Postal Zip Code</label>
                                        <input type="text" required placeholder="44000" className="w-full border rounded-lg p-2 font-medium text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                                    </div>
                                    <div className="pt-2 flex gap-2">
                                        <button type="button" onClick={() => setIsAddingNewAddress(false)} className="w-1/2 py-2 border rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition">Cancel</button>
                                        <button type="submit" className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">Save Location</button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Modal Footer Controls */}
                        {!isAddingNewAddress && (
                            <div className="bg-gray-50 border-t p-4 flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Final Order Bill:</p>
                                    <p className="text-base font-black text-gray-900">${calculateSubtotal().toFixed(2)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsAddressModalOpen(false)}
                                        className="px-3.5 py-2 border rounded-lg font-semibold text-xs text-gray-700 hover:bg-gray-100 bg-white transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={addresses.length === 0 || !selectedAddressId || checkoutLoading}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
                                    >
                                        {checkoutLoading ? "Placing Order..." : "✓ Confirm & Pay Now"}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}
