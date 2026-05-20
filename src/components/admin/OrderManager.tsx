"use client";
import { useState, useEffect } from "react";

// Structural interfaces matching your backend database payload structures
interface User {
    _id: string;
    username: string;
    email: string;
}

interface Order {
    _id: string;
    userId: User;
    addressId: string;
    totalPrice: number;
    status: "Pending" | "In Progress" | "Delivered" | "Cancelled";
    createdAt: string;
    updatedAt: string;
}

export default function OrderManager() {
    // Application memory state arrays
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "In Progress" | "Delivered" | "Cancelled">("All");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Trigger resource allocation on lifecycle initialisation
    useEffect(() => {
        fetchAdminOrders();
    }, []);

    // Secure GET Call using authorization bearers to prevent 403 errors
    const fetchAdminOrders = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3000/api/admin/orders", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 403) {
                setErrorMessage("Access Denied (403): You are either not an Admin or your session token is invalid.");
                return;
            }
            if (response.status === 401) {
                setErrorMessage("Unauthorized (401): Session expired. Please log out and sign in again.");
                return;
            }

            const data = await response.json();
            if (data.success && data.orders) {
                setOrders(data.orders);
            } else {
                setErrorMessage(data.message || "Failed to successfully populate orders log entries.");
            }
        } catch (error) {
            console.error("Critical error mapping admin orders telemetry:", error);
            setErrorMessage("Network timeout or server connectivity breakdown.");
        } finally {
            setLoading(false);
        }
    };

    // Secure PUT Call using authentication context configuration
    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const token = localStorage.getItem("token");

            // Pointing directly to your update status layout endpoint route path
            const response = await fetch(`http://localhost:3000/api/admin/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.status === 403) {
                alert("Operation aborted: Insufficient administrative elevation status permissions.");
                return;
            }

            const data = await response.json();

            if (data.success && data.order) {
                // Splice state tracking changes instantly without needing forced re-fetches
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId
                            ? { ...order, status: data.order.status, updatedAt: data.order.updatedAt }
                            : order
                    )
                );
            } else {
                alert(data.message || "Could not successfully dispatch status alterations.");
            }
        } catch (error) {
            console.error("Failure processing status parameters updates:", error);
            alert("Internal framework exception encountered while patching tracking status.");
        } finally {
            setUpdatingId(null);
        }
    };

    // Live filter evaluation
    const filteredOrders = orders.filter((order) => {
        if (filterStatus === "All") return true;
        return order.status === filterStatus;
    });

    // Structural conditional UI design badges generator
    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "In Progress": return "bg-indigo-50 text-indigo-700 border-indigo-200";
            case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full font-sans">

            {/* Container Branding Titles */}
            <div className="border-b border-gray-100 pb-4 mb-5 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Customer Checkout Logs</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Track real-time active checkout procedures and manage shipping lifecycle tracking values.</p>
                </div>
                <button
                    onClick={fetchAdminOrders}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                >
                    🔄 Refresh Feed
                </button>
            </div>

            {/* API Header Rejection Callouts Alerts */}
            {errorMessage && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                    <span>⚠️</span>
                    <p className="flex-1">{errorMessage}</p>
                </div>
            )}

            {/* Sorting Control Interfaces Workspace */}
            <div className="flex flex-wrap gap-1.5 mb-6 bg-gray-50 p-1 rounded-lg border border-gray-100 max-w-max">
                {(["All", "Pending", "In Progress", "Delivered", "Cancelled"] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${filterStatus === status
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        {status} ({status === "All" ? orders.length : orders.filter(o => o.status === status).length})
                    </button>
                ))}
            </div>

            {/* Core Dynamic Status Interfaces Panels */}
            {loading ? (
                <div className="py-12 flex justify-center items-center text-xs font-semibold text-gray-400 gap-2">
                    <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                    Synchronizing database logs safely...
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg border-gray-200 text-sm text-gray-400 font-medium">
                    No user order records found matching the chosen parameters view filter.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left text-sm divide-y divide-gray-100">
                        <thead className="bg-gray-50 text-gray-500 font-bold tracking-wide text-[11px] uppercase">
                            <tr>
                                <th className="p-4">Invoice / Buyer</th>
                                <th className="p-4">Location Reference ID</th>
                                <th className="p-4">Invoice Valuation</th>
                                <th className="p-4">Deployment Date</th>
                                <th className="p-4">Current Status</th>
                                <th className="p-4 text-right">Fulfillment Routing</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/40 transition">

                                    {/* Account / Token Reference Column */}
                                    <td className="p-4">
                                        <div className="font-bold text-indigo-600 text-xs font-mono">{order._id}</div>
                                        <div className="text-gray-900 text-xs font-semibold mt-0.5">{order.userId?.username || "Guest Account"}</div>
                                        <div className="text-gray-400 text-[10px] font-normal">{order.userId?.email || "No transactional email details"}</div>
                                    </td>

                                    {/* Saved User Addresses Reference Row Identification */}
                                    <td className="p-4">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200/60 block max-w-max">
                                            {order.addressId}
                                        </span>
                                    </td>

                                    {/* Monetary values tracking columns data outputs */}
                                    <td className="p-4 font-extrabold text-gray-900">${order.totalPrice.toFixed(2)}</td>

                                    {/* Human readable calendar conversion parsing operations */}
                                    <td className="p-4 text-xs text-gray-400 font-normal">
                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric"
                                        })}
                                    </td>

                                    {/* Component layout status badges styling values */}
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getStatusBadgeStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>

                                    {/* Dynamic select options update drop down triggers mapping fields */}
                                    <td className="p-4 text-right">
                                        <select
                                            value={order.status}
                                            disabled={updatingId === order._id}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className="text-xs bg-white border rounded-lg p-1.5 font-semibold text-gray-800 outline-none shadow-sm cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-40 transition-all"
                                        >
                                            <option value="Pending">Pending ⏳</option>
                                            <option value="In Progress">In Progress ⚙️</option>
                                            <option value="Delivered">Delivered ✅</option>
                                            <option value="Cancelled">Cancelled ❌</option>
                                        </select>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
