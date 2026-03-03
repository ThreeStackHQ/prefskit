import type { Metadata } from "next";
import { CheckCircle2, CreditCard } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UpgradeButton from "./UpgradeButton";

export const metadata: Metadata = { title: "Billing" };

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "For hobby projects",
    features: [
      "500 subscribers",
      "3 categories",
      "1,000 canSend checks/mo",
      "Hosted prefs page",
    ],
    cta: "Current plan",
    variant: "default" as const,
  },
  {
    id: "indie" as const,
    name: "Indie",
    price: "$9",
    period: "/mo",
    description: "For growing SaaS",
    features: [
      "10,000 subscribers",
      "Unlimited categories",
      "100,000 canSend checks/mo",
      "Custom branding",
      "Webhooks",
      "RFC 8058 one-click unsubscribe",
    ],
    cta: "Upgrade to Indie",
    variant: "indigo" as const,
    highlight: true,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For scaling teams",
    features: [
      "Unlimited subscribers",
      "Unlimited categories",
      "Unlimited canSend checks",
      "Webhook delivery system",
      "Custom domain",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    variant: "success" as const,
  },
];

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const currentPlan = session?.user?.plan ?? "free";

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardHeader
        title="Billing"
        description="Manage your subscription and payment method"
      />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Current plan banner */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
            <CreditCard className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-200 capitalize">
              {currentPlan} plan
            </p>
            <p className="text-xs text-slate-500">
              {currentPlan === "free"
                ? "Upgrade to unlock more features"
                : "Your subscription is active"}
            </p>
          </div>
          <Badge
            variant={
              currentPlan === "pro"
                ? "success"
                : currentPlan === "indie"
                  ? "indigo"
                  : "default"
            }
          >
            {currentPlan}
          </Badge>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-5 ${
                  plan.highlight && !isCurrent
                    ? "border-indigo-500/40 bg-indigo-600/5 shadow-lg shadow-indigo-500/10"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                {plan.highlight && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="indigo">Most popular</Badge>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-slate-100">
                      {plan.name}
                    </h3>
                    {isCurrent && <Badge variant="default">Current</Badge>}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-100">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent || plan.id === "free" ? (
                  <button
                    disabled
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-slate-800 text-slate-500 cursor-not-allowed"
                  >
                    {isCurrent ? "Current plan" : plan.cta}
                  </button>
                ) : (
                  <UpgradeButton plan={plan.id} label={plan.cta} highlight={plan.highlight} />
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
