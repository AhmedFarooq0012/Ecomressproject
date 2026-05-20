"use client";
import { useState, useEffect, Fragment } from "react";

// Matches your master backend response schema perfectly
interface Order {
    _id: string;
    userId: string;
    addressId: string;
    totalPrice: number;
    status: "Pending" | "Delivered" | "Cancelled" | string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    // Fallback map support: Agar items direct main object me maujud hon
    items?: Array<{
        _id: string;
        productId: {
            name: string;
            image: string;
            price: number;
        };
        quantity: number;
    }>;
}

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Track continuous accordion active state toggles
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/api/orders", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success && data.orders) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Failed to load purchase records:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Delivered":
                return "bg-emerald-50 border-emerald-200 text-emerald-700";
            case "Cancelled":
                return "bg-rose-50 border-rose-200 text-rose-700";
            case "Pending":
            default:
                return "bg-amber-50 border-amber-200 text-amber-700";
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm font-medium">Loading your purchase records...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 max-w-5xl mx-auto">

            {/* Header Info */}
            <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">My Purchase History</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Apne orders ke status aur items yahan se check kijiye.</p>
                </div>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                    Total Orders: {orders.length}
                </span>
            </div>

            {/* Orders Ledger Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm divide-y divide-gray-100">
                    <thead className="bg-gray-50 text-gray-500 font-semibold">
                        <tr>
                            <th className="p-4">Order ID Reference</th>
                            <th className="p-4">Date Placed</th>
                            <th className="p-4">Total Amount Paid</th>
                            <th className="p-4">Fulfillment Status</th>
                            <th className="p-4 text-right">Action Breakdown</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                        {orders.map((order) => (
                            <Fragment key={order._id}>
                                {/* Main Order Row Info */}
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-indigo-600 font-bold tracking-tight">
                                        #{order._id.substring(0, 8)}...{order._id.substring(order._id.length - 4)}
                                    </td>
                                    <td className="p-4 text-gray-500 font-normal">
                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">${order.totalPrice.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`border px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold shadow-xs transition-all ${expandedOrderId === order._id
                                                ? "bg-indigo-600 border-indigo-600 text-white"
                                                : "bg-white text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {expandedOrderId === order._id ? "Close Details" : "View Items"}
                                        </button>
                                    </td>
                                </tr>

                                {/* DYNAMIC ACCORDION LAYER FOR ORDER ITEMS DISPLAY */}
                                {expandedOrderId === order._id && (
                                    <tr>
                                        <td colSpan={5} className="bg-gray-50/80 p-5 border-t border-b border-gray-100">
                                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-150">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Itemized Line Summary</h4>

                                                {/* 1. Mapped items from memory object verification checker */}
                                                {order.items && order.items.length > 0 ? (
                                                    <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white overflow-hidden">
                                                        {order.items.map((item) => (
                                                            <div key={item._id} className="p-3 flex items-center justify-between text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gray-50 rounded-md border flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                                                                        <img
                                                                            src={item.productId?.image && item.productId.image.startsWith("http") ? item.productId.image : "https://unsplash.com"}
                                                                            alt=""
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900">{item.productId?.name || "Product Item"}</p>
                                                                        <p className="text-xs text-gray-400">Quantity Ordered: <strong className="text-gray-700">{item.quantity}</strong></p>
                                                                    </div>
                                                                </div>
                                                                <span className="font-semibold text-gray-900">
                                                                    ${((item.productId?.price || 0) * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    /* 2. Mock safe display placeholder framework in case sub-array is empty */
                                                    <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white overflow-hidden p-4">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-indigo-50 rounded-md border text-center flex items-center justify-center text-xs text-indigo-500 font-bold">
                                                                    📦
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">Standard Package Checkout Allocation</p>
                                                                    <p className="text-xs text-gray-400">Order successfully logged with status: {order.status}</p>
                                                                </div>
                                                            </div>
                                                            <span className="font-black text-indigo-600">${order.totalPrice.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}

                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                                    <span className="text-3xl block mb-2">📦</span>
                                    Aap ne abhi tak koi order nahi kiya hai.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
