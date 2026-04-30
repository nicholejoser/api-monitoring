"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/request?type=login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                toast.error("Invalid email or password.")

                setLoading(false);
                return;
            }

            // ✅ JWT cookie is automatically stored (HTTP-only)
            router.push("/dashboard");
            router.refresh();
        } catch {
            toast.error("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-slate-200 p-8 rounded-2xl shadow-xl">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        Sign in to continue to your dashboard
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-slate-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-slate-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 text-center">
                            {error}
                        </p>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-800 text-white py-2.5 rounded-lg 
                       hover:bg-slate-900 transition-all duration-200 font-medium
                       disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    © {new Date().getFullYear()} Ricklee
                </p>
            </div>
        </div>
    );
}