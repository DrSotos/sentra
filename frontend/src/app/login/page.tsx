"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
import toast from "react-hot-toast";
import { apiService } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Login to get tokens
      const res = await apiService.auth.login({ email, password });
      const token = res.data.access_token;

      // Store token first so the getMe call uses it
      if (typeof window !== 'undefined') {
        localStorage.setItem('sentra_token', token);
      }

      // Fetch user profile
      const meRes = await apiService.auth.getMe();
      const user = meRes.data;

      setAuth(user, token);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to login. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-emerald-100 rounded-full">
            <Activity className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to SENTRA</h1>
          <p className="text-sm text-slate-500">Enter your details to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="admin@sentra.eu"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="admin123"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400 mb-2">Demo credentials: admin@sentra.eu / admin123</p>
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
