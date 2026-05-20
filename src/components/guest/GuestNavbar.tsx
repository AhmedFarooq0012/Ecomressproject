"use client";

interface GuestNavbarProps {
    activeTab: "catalog" | "cart" | "orders";
    setActiveTab: (tab: "catalog" | "cart" | "orders") => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function GuestNavbar({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery
}: GuestNavbarProps) {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                {/* Left Side: Brand Logo */}
                <div className="flex items-center gap-6 md:gap-8 shrink-0">
                    <span
                        onClick={() => { setActiveTab("catalog"); setSearchQuery(""); }}
                        className="text-lg md:text-xl font-black text-indigo-600 tracking-wider uppercase cursor-pointer"
                    >
                        Marketplace
                    </span>

                    <nav className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-semibold">
                        <button
                            onClick={() => setActiveTab("catalog")}
                            className={`px-2.5 py-1.5 md:px-3 md:py-2 rounded-md transition ${activeTab === "catalog" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            🛍️ Products
                        </button>
                    </nav>
                </div>

                {/* Center Section: Search Bar (Sirf Product Catalog par active hoga) */}
                {activeTab === "catalog" && (
                    <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                            🔍
                        </div>
                        <input
                            type="text"
                            placeholder="Search products by title or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs font-bold"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}

                {/* Right Section: View Temporary Cart & Direct Login Button */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <button
                        onClick={() => setActiveTab("cart")}
                        className={`px-2.5 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-semibold transition ${activeTab === "cart" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        🛒 Cart
                    </button>

                    {/* CALL TO ACTION BUTTON FOR GUEST LOGIN */}
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white transition px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-xs"
                    >
                        Sign In
                    </button>
                </div>

            </div>
        </header>
    );
}
