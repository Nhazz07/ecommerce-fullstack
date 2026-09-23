import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login({ email, password });
            console.log("Login successful!");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
            style={{
                backgroundImage: `
                    linear-gradient(rgba(11,16,32,.88), rgba(11,16,32,.96)),
                    url("https://i.pinimg.com/1200x/2c/de/6b/2cde6b4a0f2f790f2d9042ebcee0133f.jpg")
                `,
            }}
        >
            <div className="w-full max-w-md">

                {/* Logo of ma brand  */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white">
                        Ani<span className="text-pink-400">Store</span>
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Welcome back
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#0B1020]/90 backdrop-blur-xl border border-pink-400/20 rounded-2xl p-8 shadow-2xl">

                    <h2 className="text-xl font-semibold text-white mb-6">
                        Sign in to your account
                    </h2>

                    {error && (
                        <p className="mb-5 text-sm text-pink-400">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-pink-400 transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-pink-400 transition"
                            />
                        </div>

                        {/* Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-pink-400 text-[#0B1020] font-semibold hover:bg-pink-300 transition disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs text-gray-500">OR</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>


                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?
                        <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-pink-400 ml-1 hover:text-pink-300"
                        >

                            Create account
                        </button>
                    </p>

                </div>

                <p className="text-center text-xs text-gray-600 mt-6">
                    © 2026 AniStore
                </p>

            </div>
        </div>
    );
}
