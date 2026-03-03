import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your free PrefsKit account",
};

const benefits = [
  "Free plan, no credit card required",
  "Hosted preferences page in minutes",
  "Works with Resend, SendGrid, any SMTP",
];

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 mb-3">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-slate-400">Get started with PrefsKit for free</p>
        </div>

        {/* Benefits */}
        <div className="flex flex-col gap-1.5">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              {b}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="first-name" className="block text-sm font-medium text-slate-300">
                First name
              </label>
              <input
                id="first-name"
                type="text"
                autoComplete="given-name"
                placeholder="Jane"
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="last-name" className="block text-sm font-medium text-slate-300">
                Last name
              </label>
              <input
                id="last-name"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@yourcompany.com"
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="workspace" className="block text-sm font-medium text-slate-300">
              Workspace name
            </label>
            <input
              id="workspace"
              type="text"
              placeholder="My SaaS App"
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 mt-2"
          >
            Create account
          </button>
          <p className="text-center text-xs text-slate-500">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>.
          </p>
        </div>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
