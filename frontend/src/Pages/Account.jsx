import {
    ArrowRight,
    LogOut,
    Package,
    User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";

function Account() {
    const navigate = useNavigate();

    const {
        isAuthenticated,
        logout,
    } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white">
                <div className="mx-auto max-w-4xl py-20 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10">
                        <User
                            size={30}
                            className="text-pink-500"
                        />
                    </div>

                    <h1 className="mt-5 text-3xl font-bold">
                        Sign in to your account
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-gray-400">
                        Please sign in to view and manage your account.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="mt-7 rounded-xl bg-pink-500 px-6 py-3 font-semibold text-[#0B1020] transition hover:bg-pink-400"
                    >
                        Sign In
                    </button>

                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 pb-20 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">

            <div className="mx-auto max-w-5xl">

                {/* Header */}
                <div className="mb-8">

                    <p className="text-sm font-semibold uppercase tracking-wider text-pink-500">
                        My Account
                    </p>

                    <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                        Account Information
                    </h1>

                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Manage your account and access your AniStore activity.
                    </p>

                </div>

                {/* Profile Card */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-500/10">
                            <User
                                size={26}
                                className="text-pink-500"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                My Profile
                            </h2>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your account information
                            </p>
                        </div>

                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-white/10">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Account Status
                            </p>

                            <div className="mt-2 flex items-center gap-2">

                                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                                <span className="text-sm font-medium text-green-500">
                                    Signed in
                                </span>

                            </div>
                        </div>

                    </div>

                </section>

                {/* Account Actions */}
                <section className="mt-6 grid gap-4 sm:grid-cols-2">

                    {/* Orders */}
                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-pink-400 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-pink-400"
                    >
                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10">
                                <Package
                                    size={21}
                                    className="text-pink-500"
                                />
                            </div>

                            <div>
                                <h2 className="font-bold">
                                    My Orders
                                </h2>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    View your orders
                                </p>
                            </div>

                        </div>

                        <ArrowRight
                            size={19}
                            className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-pink-500"
                        />

                    </button>

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="group flex items-center justify-between rounded-2xl border border-red-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-red-400 hover:shadow-md dark:border-red-500/20 dark:bg-white/5 dark:hover:border-red-400"
                    >
                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                                <LogOut
                                    size={21}
                                    className="text-red-500"
                                />
                            </div>

                            <div>
                                <h2 className="font-bold">
                                    Sign Out
                                </h2>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Sign out of your account
                                </p>
                            </div>

                        </div>

                        <ArrowRight
                            size={19}
                            className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-red-500"
                        />

                    </button>

                </section>

            </div>

        </main>
    );
}

export default Account;
