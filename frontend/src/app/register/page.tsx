"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
import toast from "react-hot-toast";
import { apiService } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    try {
      await apiService.auth.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-emerald-100 rounded-full">
            <Activity className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
          <p className="text-sm text-slate-500">Join the SENTRA platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={formData.confirm_password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
