import { useEffect, useState } from "react";
import { getMyOrders } from "../Services/orderApi";

function Order() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error(
                        "You must be logged in to view your orders."
                    );
                }

                const response = await getMyOrders(token);

                console.log("My orders:", response);

                setOrders(response?.data || []);
            } catch (error) {
                console.error(
                    "Failed to fetch orders:",
                    error
                );

                setError(
                    error.message ||
                    "Failed to load your orders."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-white px-4 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
                <div className="mx-auto max-w-5xl py-20 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Loading your orders...
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-white px-4 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
                <div className="mx-auto max-w-5xl py-20 text-center">
                    <h1 className="text-3xl font-bold">
                        My Orders
                    </h1>

                    <p className="mt-4 text-red-500">
                        {error}
                    </p>
                </div>
            </main>
        );
    }

    if (orders.length === 0) {
        return (
            <main className="min-h-screen bg-white px-4 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
                <div className="mx-auto max-w-5xl py-20 text-center">
                    <h1 className="text-3xl font-bold">
                        My Orders
                    </h1>

                    <p className="mt-4 text-gray-500 dark:text-gray-400">
                        You haven't placed any orders yet.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
            <div className="mx-auto max-w-5xl">

                <h1 className="mb-8 text-3xl font-bold">
                    My Orders
                </h1>

                <div className="space-y-5">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5"
                        >
                            {/* Order Header */}
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Order #{order.orderNumber}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {order.orderDate
                                            ? new Date(
                                                order.orderDate
                                            ).toLocaleDateString()
                                            : "Date unavailable"}
                                    </p>
                                </div>

                                <div className="text-left sm:text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Total
                                    </p>

                                    <p className="text-lg font-bold">
                                        $
                                        {Number(
                                            order.totalAmount || 0
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="my-5 border-t border-gray-200 dark:border-white/10" />

                            {/* Order Information */}
                            <div className="flex flex-wrap gap-3">
                                <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
                                    {order.status}
                                </span>

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                    Payment #{order.paymentId || "Pending"}
                                </span>

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                    Shipment #{order.shipmentId || "Pending"}
                                </span>
                            </div>

                            {/* Price Breakdown */}
                            <div className="mt-5 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Subtotal
                                    </span>

                                    <span>
                                        $
                                        {Number(
                                            order.subTotal || 0
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Shipping
                                    </span>

                                    <span>
                                        $
                                        {Number(
                                            order.shippingFee || 0
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                {Number(order.discountAmount || 0) > 0 && (
                                    <div className="flex justify-between text-green-500">
                                        <span>
                                            Discount
                                        </span>

                                        <span>
                                            -$
                                            {Number(
                                                order.discountAmount
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div className="my-3 border-t border-gray-200 dark:border-white/10" />

                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>

                                    <span>
                                        $
                                        {Number(
                                            order.totalAmount || 0
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="mt-5">
                                <p className="text-sm font-semibold">
                                    Shipping Address
                                </p>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {order.shippingAddress}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default Order;
