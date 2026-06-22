"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const toastID = toast.loading("Signing in..");
    try {
      const res = await fetch("/api/requests?type=login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        toast.error("Invalid username or password.");

        setLoading(false);
        return;
      }
      toast.dismiss(toastID);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      toast.dismiss(toastID);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 to-slate-300">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-slate-200 p-8 rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-2 font-semibold">Sign in</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="username"
              required
              className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-slate-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

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
