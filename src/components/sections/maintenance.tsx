"use client";

import * as React from "react";
import { Check, ArrowRight, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { useBooking } from "@/hooks/use-booking";

type Plan = {
  id: string;
  name: string;
  usdPrice: number;
  cadence: string;
  blurb: string;
  features: { text: string; included: boolean }[];
  bestCoverage?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "request-a-fix",
    name: "Request a Fix",
    usdPrice: 39,
    cadence: "one-time · no subscription",
    blurb: "Got an existing site that needs one thing fixed? We'll audit it and ship one scoped improvement — a bug fix, small feature, or SEO tweak — in 3-5 days.",
    features: [
      { text: "One scoped improvement", included: true },
      { text: "Audit of existing site", included: true },
      { text: "Bug fix OR small feature OR SEO tweak", included: true },
      { text: "3-5 day delivery", included: true },
      { text: "Source code of the fix", included: true },
    ],
  },
  {
    id: "care-basic",
    name: "Care Basic",
    usdPrice: 49,
    cadence: "per month",
    blurb: "Weekly backups, uptime + SSL monitoring, security patching, 2 content-edit requests per month, monthly health report.",
    features: [
      { text: "Weekly backups", included: true },
      { text: "Uptime + SSL monitoring", included: true },
      { text: "Security patching", included: true },
      { text: "2 content-edit requests / month", included: true },
      { text: "Monthly health report", included: true },
      { text: "Email support (24h response)", included: true },
    ],
  },
  {
    id: "care-complete",
    name: "Care Complete",
    usdPrice: 149,
    cadence: "per month",
    blurb: "Everything in Basic, plus unlimited content edits, 24/7 monitoring with same-day incident response, backend/server management, performance tuning, monthly SEO health check with keyword tracking, light ad-campaign monitoring, and a priority support line.",
    features: [
      { text: "Everything in Care Basic", included: true },
      { text: "Unlimited content edits", included: true },
      { text: "24/7 monitoring + same-day incident response", included: true },
      { text: "Backend / server management", included: true },
      { text: "Performance tuning", included: true },
      { text: "Monthly SEO health check + keyword tracking", included: true },
      { text: "Light ad-campaign monitoring", included: true },
      { text: "Priority support line (Discord)", included: true },
    ],
    bestCoverage: true,
  },
];

export function Maintenance() {
  const { format, currency } = useCurrency();
  const { openBooking } = useBooking();
  const [activeMobile, setActiveMobile] = React.useState(0);

  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 0 && activeMobile < PLANS.length - 1) setActiveMobile((v) => v + 1);
      else if (e.deltaX < 0 && activeMobile > 0) setActiveMobile((v) => v - 1);
    }
  };
  const touchStartX = React.useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -40 && activeMobile < PLANS.length - 1) setActiveMobile((v) => v + 1);
    else if (delta > 40 && activeMobile > 0) setActiveMobile((v) => v - 1);
  };

  return (
    <section id="maintenance" className="scroll-mt-16 py-16 sm:py-20 relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mb-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="eyebrow text-primary mb-3 flex items-center gap-2"
          >
            <span className="h-px w-8 bg-primary/50" /> 03 · Ongoing Care
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            Maintenance <span className="text-gradient-cyan">plans.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.16, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed"
          >
            Keeps your existing site running smoothly — this is not new
            development.{" "}
            <span className="text-foreground/80">
              Request a Fix is the only exception: we'll make one specific
              improvement to your site.
            </span>
          </motion.p>
        </div>

        {/* Desktop: 3 wide cards — same style as pricing TierCard */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              formatPrice={(usd) => format(usd, plan.id, { perMonth: plan.cadence.includes("month") })}
              currencyCode={currency.code}
              onChoose={() =>
                openBooking({
                  plan: plan.name,
                  price: format(plan.usdPrice, plan.id, { perMonth: plan.cadence.includes("month") }),
                  budget: "maintenance",
                  projectType: "maintenance",
                })
              }
            />
          ))}
        </div>

        {/* Mobile: playing-card stack with tilted peeking cards */}
        <div
          className="lg:hidden relative"
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="card-stack" style={{ height: "620px" }}>
            {PLANS.map((plan, i) => {
              const diff = i - activeMobile;
              const priceLabel = format(plan.usdPrice, plan.id, { perMonth: plan.cadence.includes("month") });

              // Compute transform — spring-animated for 60fps
              let transform: string;
              let opacity = 0;
              let zIndex = 0;
              let boxShadow = "0 10px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px color-mix(in srgb, var(--primary) 15%, transparent)";
              if (diff === 0) {
                transform = "translateX(0px) translateZ(40px) rotateY(0deg) scale(1)";
                opacity = 1;
                zIndex = 10;
                boxShadow = "0 20px 60px -10px rgba(0,0,0,0.9), 0 0 0 1px color-mix(in srgb, var(--primary) 60%, transparent), 0 0 60px -8px color-mix(in srgb, var(--primary) 60%, transparent)";
              } else if (diff === -1) {
                transform = "translateX(-110px) translateZ(-30px) rotateY(18deg) scale(0.92)";
                opacity = 0.7;
                zIndex = 5;
              } else if (diff === 1) {
                transform = "translateX(110px) translateZ(-30px) rotateY(-18deg) scale(0.92)";
                opacity = 0.7;
                zIndex = 5;
              } else if (diff < -1) {
                transform = "translateX(-180px) translateZ(-60px) rotateY(28deg) scale(0.82)";
                opacity = 0.35;
                zIndex = 1;
              } else {
                transform = "translateX(180px) translateZ(-60px) rotateY(-28deg) scale(0.82)";
                opacity = 0.35;
                zIndex = 1;
              }

              return (
                <motion.div
                  key={plan.id}
                  className="playing-card"
                  style={{ zIndex, height: "580px" }}
                  animate={{ transform, opacity, boxShadow }}
                  transition={{ type: "spring", stiffness: 280, damping: 28, mass: 1.0 }}
                  onClick={() => setActiveMobile(i)}
                >
                  {plan.bestCoverage && (
                    <div className="absolute top-3 right-3 z-20">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-primary text-background">
                        <Wrench className="h-2 w-2" />
                        Most Coverage
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold tracking-tight font-mono text-gradient-cyan">
                      {priceLabel}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{plan.cadence}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{plan.blurb}</p>

                  <div className="feat-list mb-4">
                    {plan.features.map((f, fi) => (
                      <div key={fi} className="feat-row">
                        <Check className="feat-tick h-3.5 w-3.5" />
                        <span className="feat-text text-xs">{f.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBooking({
                        plan: plan.name,
                        price: priceLabel,
                        budget: "maintenance",
                        projectType: "maintenance",
                      });
                    }}
                    variant={plan.bestCoverage ? "default" : "outline"}
                    className={cn(
                      "w-full group text-sm h-10 mt-auto",
                      plan.bestCoverage
                        ? "bg-primary hover:bg-primary/90 text-background border-0 font-semibold"
                        : "border-primary/40 text-primary/80 hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    Choose {plan.name}
                    <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setActiveMobile((v) => Math.max(0, v - 1))}
              disabled={activeMobile === 0}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-card text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5">
              {PLANS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMobile(i)}
                  aria-label={`Go to plan ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === activeMobile ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveMobile((v) => Math.min(PLANS.length - 1, v + 1))}
              disabled={activeMobile === PLANS.length - 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-card text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Swipe left/right or use arrows · {activeMobile + 1} of {PLANS.length}
          </p>
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  index,
  formatPrice,
  currencyCode,
  onChoose,
}: {
  plan: Plan;
  index: number;
  formatPrice: (usd: number) => string;
  currencyCode: string;
  onChoose: () => void;
}) {
  const priceLabel = formatPrice(plan.usdPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "relative rounded-xl border bg-card p-5 flex flex-col h-full transition-colors shadow-lg",
        plan.bestCoverage
          ? "border-primary/60 glow-cyan-strong shadow-primary/20"
          : "border-primary/20 hover:border-primary/50 hover:shadow-xl"
      )}
    >
      {plan.bestCoverage && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-primary text-background whitespace-nowrap">
            <Wrench className="h-2.5 w-2.5" />
            Most Coverage
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
          <Wrench className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold tracking-tight">{plan.name}</h3>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold tracking-tight font-mono text-gradient-cyan">
          {priceLabel}
        </span>
      </div>
      <p className="text-[10px] font-mono text-muted-foreground mb-3">{plan.cadence}</p>

      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{plan.blurb}</p>

      <div className="feat-list mb-4 flex-1">
        {plan.features.map((f, i) => (
          <div key={i} className="feat-row">
            <Check className="feat-tick h-3.5 w-3.5" />
            <span className="feat-text text-xs">{f.text}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onChoose}
        variant={plan.bestCoverage ? "default" : "outline"}
        className={cn(
          "w-full group text-xs h-9 mt-auto",
          plan.bestCoverage
            ? "bg-primary hover:bg-primary/90 text-background border-0 font-semibold"
            : "border-primary/40 text-primary/80 hover:bg-primary/10 hover:text-primary"
        )}
      >
        Choose {plan.name}
        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
      </Button>
    </motion.div>
  );
}

function MobilePlanCard({
  plan,
  formatPrice,
  onChoose,
}: {
  plan: Plan;
  formatPrice: (usd: number) => string;
  onChoose: () => void;
}) {
  const priceLabel = formatPrice(plan.usdPrice);

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card p-6 flex flex-col",
        plan.bestCoverage
          ? "border-primary/60 glow-cyan-strong"
          : "border-border"
      )}
    >
      {plan.bestCoverage && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-primary text-background whitespace-nowrap">
            <Wrench className="h-3 w-3" />
            Most Coverage
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
          <Wrench className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">{plan.name}</h3>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-bold tracking-tight font-mono text-gradient-cyan">
          {priceLabel}
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">{plan.cadence}</span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{plan.blurb}</p>

      <div className="feat-list mb-5">
        {plan.features.map((f, i) => (
          <div key={i} className="feat-row">
            <Check className="feat-tick h-4 w-4" />
            <span className="feat-text text-sm">{f.text}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onChoose}
        variant={plan.bestCoverage ? "default" : "outline"}
        className={cn(
          "w-full group text-base h-12 mt-auto",
          plan.bestCoverage
            ? "bg-primary hover:bg-primary/90 text-background border-0 font-semibold"
            : "border-primary/40 text-primary/80 hover:bg-primary/10 hover:text-primary"
        )}
      >
        Choose {plan.name}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
