import Link from "next/link";
import { Activity, BarChart3, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-slate-200">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Activity className="h-6 w-6 text-emerald-600" />
          <span className="font-bold text-xl text-slate-900">SENTRA</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium text-emerald-600 hover:underline underline-offset-4" href="/register">
            Register
          </Link>
        </nav>
      </header>
      <main className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-100">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900">
                  Smart Environmental Network for Territorial Resilience Analytics
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl dark:text-slate-400">
                  Advanced EU environmental monitoring platform integrating real-time IoT sensors and AI-driven predictive analytics.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-700"
                >
                  View Dashboard
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-emerald-50 hover:text-emerald-900"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-4">
                <div className="p-4 bg-emerald-100 rounded-full">
                  <Activity className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold">Real-time Monitoring</h2>
                <p className="text-slate-500">Live data ingestion from hundreds of stations across Europe.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-4">
                <div className="p-4 bg-emerald-100 rounded-full">
                  <BarChart3 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold">AI Analytics</h2>
                <p className="text-slate-500">Predictive forecasting and anomaly detection powered by ML.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-4">
                <div className="p-4 bg-emerald-100 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold">EU Compliance</h2>
                <p className="text-slate-500">Built in accordance with Horizon Europe environmental directives.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t flex flex-col sm:flex-row bg-white">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} SENTRA. An EU Horizon Europe Initiative.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6 mt-4 sm:mt-0">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
