import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Tag,
  Globe,
  Zap,
  Mail,
  Webhook,
  CheckCircle2,
  X,
  ArrowRight,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "PrefsKit — Email Preference Center for Indie SaaS",
  description:
    "Manage email preferences in 5 minutes. RFC 8058 one-click unsubscribe, GDPR suppression, granular categories. Works with any SMTP. From $0/mo.",
  alternates: { canonical: "https://prefskit.io" },
  openGraph: {
    title: "PrefsKit — Email Preference Center for Indie SaaS",
    description: "Manage email preferences in 5 minutes. From $0/mo.",
    url: "https://prefskit.io",
    type: "website",
  },
};

const features = [
  {
    icon: ShieldCheck,
    title: "RFC 8058 One-Click Unsubscribe",
    description:
      "Gmail & Yahoo require it. We handle List-Unsubscribe headers automatically so your emails land in inbox, not spam.",
    accent: "emerald",
  },
  {
    icon: ShieldCheck,
    title: "GDPR Suppression",
    description:
      "Global suppression list with audit trail. canSend() automatically blocks suppressed addresses. Compliance in one call.",
    accent: "emerald",
  },
  {
    icon: Tag,
    title: "Granular Categories",
    description:
      'Let subscribers choose what they receive. "Marketing", "Product updates", "Transactional" — you define them.',
    accent: "indigo",
  },
  {
    icon: Globe,
    title: "Works with Any SMTP",
    description:
      "Resend, Postmark, SendGrid, AWS SES, or your own mail server. PrefsKit is transport-agnostic.",
    accent: "indigo",
  },
  {
    icon: Mail,
    title: "Hosted Preferences Page",
    description:
      "Beautiful, branded /u/[token] page. Zero setup. White-label on Starter plan. Subscribers love it.",
    accent: "amber",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description:
      "Get notified on preference changes, suppressions, and unsubscribes. Sync to your CRM in real-time.",
    accent: "amber",
  },
];

const featureAccent: Record<string, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "/mo forever",
    description: "For hobby projects and prototypes",
    cta: "Get started free",
    ctaVariant: "outline" as const,
    features: [
      "500 subscribers",
      "3 email categories",
      "1,000 canSend checks/mo",
      "Hosted preferences page",
      "API access",
    ],
    missing: ["Custom branding", "Webhooks", "Priority support"],
    highlight: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    description: "For growing SaaS products",
    cta: "Start free trial",
    ctaVariant: "primary" as const,
    badge: "Most popular",
    features: [
      "10,000 subscribers",
      "Unlimited categories",
      "100,000 canSend checks/mo",
      "Custom branding",
      "Webhooks",
      "RFC 8058 auto-headers",
      "Email support",
    ],
    missing: ["Custom domain", "SSO"],
    highlight: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For scaling teams",
    cta: "Start free trial",
    ctaVariant: "outline" as const,
    features: [
      "Unlimited subscribers",
      "Unlimited categories",
      "Unlimited canSend checks",
      "Custom domain",
      "Priority support",
      "SLA guarantee",
      "SSO (coming soon)",
    ],
    missing: [],
    highlight: false,
  },
];

const competitors = [
  {
    name: "Customer.io",
    price: "$100+/mo",
    setup: "Days",
    verdict: "Overkill for indie SaaS",
  },
  {
    name: "Loops",
    price: "$49+/mo",
    setup: "Hours",
    verdict: "Marketing-first, not preference-first",
  },
  {
    name: "DIY solution",
    price: "$0 + 3 days dev",
    setup: "3+ days",
    verdict: "Maintenance burden forever",
  },
  {
    name: "PrefsKit",
    price: "From $0/mo",
    setup: "5 min",
    verdict: "Made for indie SaaS ✓",
    highlight: true,
  },
];

const testimonials = [
  {
    quote:
      "PrefsKit saved us from a GDPR audit nightmare. One afternoon of integration and we had a fully compliant preference center.",
    author: "Sarah K.",
    role: "Founder, DevMetrics",
    avatar: "SK",
  },
  {
    quote:
      "canSend() is genius. Instead of building suppression logic ourselves, it's literally one line. Deployed to production in 30 minutes.",
    author: "Marcus T.",
    role: "CTO, FormFlow",
    avatar: "MT",
  },
  {
    quote:
      "Our open rates went up 12% after switching — Gmail was penalizing us for missing List-Unsubscribe headers. PrefsKit fixed that instantly.",
    author: "Priya R.",
    role: "Solo founder, InvoiceAI",
    avatar: "PR",
  },
];

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PrefsKit",
  description: "Email preference center for indie SaaS",
  url: "https://prefskit.io",
  applicationCategory: "BusinessApplication",
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
    { "@type": "Offer", price: "9", priceCurrency: "USD", name: "Starter" },
    { "@type": "Offer", price: "29", priceCurrency: "USD", name: "Pro" },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight">PrefsKit</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-slate-200 transition-colors">Pricing</a>
              <a href="/docs" className="hover:text-slate-200 transition-colors">Docs</a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Get started free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-4xl px-4 py-24 text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Now in beta — free to start
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Manage email preferences{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                in 5 minutes
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 mb-10">
              A hosted preference center and suppression API for indie SaaS.
              One line of code to check if you can send. RFC 8058, GDPR-ready,
              works with any SMTP.
            </p>

            {/* Code snippet */}
            <div className="mx-auto mb-10 max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-4 text-left shadow-2xl">
              <div className="flex items-center gap-1.5 mb-3">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="ml-2 text-xs text-slate-600 font-mono">send-email.ts</span>
              </div>
              <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-purple-400">import</span>
                  <span className="text-slate-300">{" { PrefsKit } "}</span>
                  <span className="text-purple-400">from</span>
                  <span className="text-green-400">{" '@prefskit/sdk'\n\n"}</span>
                  <span className="text-purple-400">const</span>
                  <span className="text-sky-300">{" ok "}</span>
                  <span className="text-slate-400">{"= "}</span>
                  <span className="text-purple-400">{"await "}</span>
                  <span className="text-sky-300">{"prefskit"}</span>
                  <span className="text-slate-400">{"."}</span>
                  <span className="text-green-400">{"canSend"}</span>
                  <span className="text-slate-300">{"(email, "}</span>
                  <span className="text-orange-300">{"'marketing'"}</span>
                  <span className="text-slate-300">{")\n"}</span>
                  <span className="text-purple-400">{"if "}</span>
                  <span className="text-slate-300">{"(ok) "}</span>
                  <span className="text-purple-400">{"await "}</span>
                  <span className="text-slate-300">{"resend"}</span>
                  <span className="text-slate-400">{"."}</span>
                  <span className="text-green-400">{"emails"}</span>
                  <span className="text-slate-400">{"."}</span>
                  <span className="text-green-400">{"send"}</span>
                  <span className="text-slate-300">{"(...)"}</span>
                </code>
              </pre>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all duration-150"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pricing"
                className="rounded-xl border border-slate-700 px-8 py-3.5 text-base font-semibold text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-all duration-150"
              >
                See pricing
              </a>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              No credit card required · Free plan available · Setup in minutes
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built specifically for indie SaaS founders who want compliance without the enterprise complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition-colors"
                >
                  <div
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${featureAccent[feature.accent]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Competitor comparison */}
        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Why not the alternatives?</h2>
            <p className="text-slate-400">We looked at what was out there. Then we built something better.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="grid grid-cols-4 border-b border-slate-800 px-5 py-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Solution</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Price</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Setup</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center hidden sm:block">Notes</div>
            </div>
            {competitors.map((c) => (
              <div
                key={c.name}
                className={`grid grid-cols-4 items-center px-5 py-4 border-b border-slate-800 last:border-0 ${
                  c.highlight ? "bg-indigo-600/5 border-indigo-500/20" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${c.highlight ? "text-indigo-300" : "text-slate-300"}`}>
                    {c.name}
                  </span>
                  {c.highlight && (
                    <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">You</span>
                  )}
                </div>
                <div className={`text-sm text-center ${c.highlight ? "text-emerald-400 font-semibold" : "text-slate-400"}`}>
                  {c.price}
                </div>
                <div className={`text-sm text-center ${c.highlight ? "text-emerald-400 font-semibold" : "text-slate-400"}`}>
                  {c.setup}
                </div>
                <div className={`text-xs hidden sm:block text-center ${c.highlight ? "text-slate-300" : "text-slate-500"}`}>
                  {c.verdict}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-5xl px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-slate-400">
              Start free. Upgrade when you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 ${
                  plan.highlight
                    ? "border-indigo-500/40 bg-gradient-to-b from-indigo-600/10 to-slate-900 shadow-xl shadow-indigo-500/10"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white mb-0.5">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>

                <ul className="mb-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <X className="h-4 w-4 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-150 ${
                    plan.highlight
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                      : "border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Loved by indie founders</h2>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-sm text-slate-400">4.9/5 from early users</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-bold text-indigo-300">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{t.author}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mx-auto max-w-4xl px-4 py-16">
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/20 to-slate-900 p-10 text-center">
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-emerald-600/5" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Ready in 5 minutes
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Join indie SaaS founders who stopped rolling their own preference centers and shipped features instead.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="/docs"
                className="rounded-xl border border-slate-700 px-8 py-3.5 text-base font-semibold text-slate-300 hover:border-slate-600 hover:text-white transition-all"
              >
                Read the docs
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-600">Free plan available · No credit card required</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-8">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-400">PrefsKit</span>
                <span className="text-sm text-slate-600">by ThreeStack</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
                <a href="/docs" className="hover:text-slate-300 transition-colors">Docs</a>
                <a href="mailto:hello@prefskit.io" className="hover:text-slate-300 transition-colors">Contact</a>
              </div>
              <p className="text-xs text-slate-600">© 2026 ThreeStack. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
