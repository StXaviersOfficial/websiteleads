"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Mail, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useBooking } from "@/hooks/use-booking";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DiscordLogo } from "@/components/discord-fab";

const PROJECT_TYPES = [
  { value: "web-app", label: "Web app" },
  { value: "static-site", label: "Static HTML/CSS site" },
  { value: "landing-page", label: "Landing page" },
  { value: "android-app", label: "Android app" },
  { value: "seo", label: "SEO ranking" },
  { value: "minecraft-mod", label: "Minecraft mod" },
  { value: "api-integration", label: "API / integration" },
  { value: "automation", label: "Automation script" },
  { value: "discord-bot", label: "Discord bot" },
  { value: "telegram-bot", label: "Telegram bot" },
  { value: "whatsapp-bot", label: "WhatsApp automation" },
  { value: "custom-domain", label: "Custom domain setup" },
  { value: "other", label: "Something else" },
];

const PROJECT_BUDGETS = [
  { value: "demo", label: "Free Demo — $0" },
  { value: "starter", label: "Starter — $99" },
  { value: "growth", label: "Growth — $249" },
  { value: "pro", label: "Pro — $599" },
  { value: "elite", label: "Elite — $1,499" },
  { value: "enterprise", label: "Enterprise — Custom quote" },
  { value: "undecided", label: "Not sure yet" },
];

const MAINTENANCE_BUDGETS = [
  { value: "request-a-fix", label: "Request a Fix — $39" },
  { value: "care-basic", label: "Care Basic — $49/mo" },
  { value: "care-complete", label: "Care Complete — $149/mo" },
  { value: "undecided", label: "Not sure yet" },
];

const TIMELINES = [
  { value: "1-month", label: "Within 1 month" },
  { value: "asap", label: "ASAP — within 1 week" },
  { value: "2-weeks", label: "Within 2 weeks" },
  { value: "flexible", label: "Flexible" },
];

// Step definitions
// Step 0: Welcome (Discord + email options)
// Step 1: Name + Email (progress 20%)
// Step 2: Mode (Book a Project / Maintenance) (progress 40%)
// Step 3: Project type + Budget + Timeline (progress 70%)
// Step 4: Brief (progress 90% → 100% on submit)
// Step 5: Done (progress 100%)
const STEPS = [
  { id: 0, name: "Start", progress: 0 },
  { id: 1, name: "Contact", progress: 20 },
  { id: 2, name: "Project type", progress: 40 },
  { id: 3, name: "Details", progress: 70 },
  { id: 4, name: "Brief", progress: 90 },
  { id: 5, name: "Done", progress: 100 },
];

export function BookingModal() {
  const { open, preset, closeBooking } = useBooking();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mode, setMode] = React.useState<"project" | "maintenance">("project");
  const [projectType, setProjectType] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [timeline, setTimeline] = React.useState("");
  const [brief, setBrief] = React.useState("");

  // Apply preset when modal opens + reset state
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setName("");
      setEmail("");
      setBrief("");

      const isMaintenance = preset.projectType === "maintenance" || preset.budget === "maintenance";
      setMode(isMaintenance ? "maintenance" : "project");

      // Smart defaults (UX psychology: pre-select most common)
      // Use setTimeout to ensure state is set after Select components mount
      const timer = setTimeout(() => {
        if (isMaintenance) {
          setProjectType("maintenance");
          const pb = preset.budget && preset.budget !== "maintenance" ? preset.budget : "request-a-fix";
          setBudget(pb);
        } else {
          const pb = preset.budget && preset.budget !== "maintenance" ? preset.budget : "growth";
          setBudget(pb);
          setProjectType("web-app");
        }
        setTimeline("1-month");
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [open, preset]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) closeBooking();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, closeBooking]);

  const currentProgress = STEPS[step].progress;

  function canProceed(): boolean {
    if (step === 1) {
      // Name + Email required
      if (!name || name.trim().length < 2) return false;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    }
    if (step === 3) {
      if (!budget) return false;
      if (mode === "project" && !projectType) return false;
      if (mode === "project" && !timeline) return false;
      // Maintenance mode: only budget is required, no project type or timeline
    }
    if (step === 4) {
      if (!brief || brief.trim().length < 10) return false;
    }
    return true;
  }

  function nextStep() {
    if (!canProceed()) {
      toast.error("Please complete the required fields first");
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  }

  function prevStep() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function submitEnquiry() {
    if (submitting) return;
    if (!canProceed()) {
      toast.error("Please write a brief (at least 10 characters)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, project_type: projectType, budget, timeline, mode,
          message: brief,
          source: "quackforge-booking-wizard",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Submit failed");
      setStep(5); // Done
      toast.success("Project enquiry received — we'll reply within 24 hours.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submit failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const budgetOptions = mode === "maintenance" ? MAINTENANCE_BUDGETS : PROJECT_BUDGETS;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="booking-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => !submitting && closeBooking()}
          />
          {/* Full-screen modal */}
          <motion.div
            className="booking-modal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !submitting) closeBooking();
            }}
          >
            <div className="booking-modal-inner relative w-full max-w-2xl mx-auto bg-card border-x border-primary/20 px-5 sm:px-8 py-6">
              {/* Header with progress bar + step indicators — sticky */}
              <div className="sticky top-0 -mx-5 sm:-mx-8 px-5 sm:px-8 py-4 bg-card/95 border-b border-primary/20 z-10 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="eyebrow text-primary mb-0.5">Project Booking</p>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {step === 0 && "Let's start."}
                      {step === 1 && "How can we reach you?"}
                      {step === 2 && "What are you booking?"}
                      {step === 3 && (mode === "maintenance" ? "Maintenance plan" : "Project details")}
                      {step === 4 && (mode === "maintenance" ? "Describe the issue" : "Project brief")}
                      {step === 5 && "All set."}
                    </h2>
                  </div>
                  <button
                    onClick={closeBooking}
                    disabled={submitting}
                    aria-label="Close"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Step indicators — numbered circles */}
                {step > 0 && step < 5 && (
                  <div className="flex items-center justify-between mb-3 px-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="flex items-center flex-1">
                        <div
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold transition-all shrink-0",
                            step >= s
                              ? "bg-primary text-background glow-cyan"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {step > s ? <Check className="h-3 w-3" /> : s}
                        </div>
                        {s < 4 && (
                          <div className="flex-1 h-0.5 mx-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: step > s ? "100%" : "0%" }}
                              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress bar — never 0% (always shows something) */}
                {step > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Step {step} of {STEPS.length - 1}</span>
                      <span className="font-mono text-primary font-semibold">{currentProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${currentProgress}%` }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        style={{ boxShadow: "0 0 8px rgba(34,211,238,0.6)" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                {/* STEP 0: Welcome */}
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-6"
                  >
                    <div className="text-center py-8">
                      <p className="text-lg text-muted-foreground mb-2">
                        Your free demo is ready in 48 hours. No payment needed to start.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Takes about 2 minutes. You're in control the whole way.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href="https://discord.gg/VhKgEetwr8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-4 rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/5 hover:bg-[#5865F2]/10 hover:border-[#5865F2] transition-colors group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2] text-white">
                          <DiscordLogo className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Faster on Discord</p>
                          <p className="text-xs text-muted-foreground">Usually replies in minutes</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#7984F5] group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a
                        href="mailto:quackforgeofficial@gmail.com?subject=Project%20enquiry%20from%20QuackForge"
                        className="flex items-center gap-3 px-4 py-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-colors group"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 border border-primary/30 text-primary">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Email us instead</p>
                          <p className="text-xs text-muted-foreground">quackforgeofficial@gmail.com</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>

                    {preset.plan && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-mono uppercase text-primary mb-0.5">Selected plan</p>
                          <p className="text-sm font-semibold">
                            {preset.plan}{preset.price ? ` · ${preset.price}` : ""}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setStep(1)}
                      className="w-full bg-primary hover:bg-primary/90 text-background font-semibold border-0 group h-12"
                      size="lg"
                    >
                      Or Continue on Web
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Prefer to talk first? Use Discord or email above.
                    </p>
                  </motion.div>
                )}

                {/* STEP 1: Name + Email */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-5 pb-12"
                  >
                    <div>
                      <Label htmlFor="bk-name" className="text-sm font-medium text-foreground/90 mb-2 block">
                        Business or brand name
                      </Label>
                      <Input
                        id="bk-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && canProceed()) nextStep(); }}
                        autoComplete="name"
                        className="bg-background border-primary/20 focus:border-primary focus:ring-primary/30 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bk-email" className="text-sm font-medium text-foreground/90 mb-2 block">
                        Email
                      </Label>
                      <Input
                        id="bk-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && canProceed()) nextStep(); }}
                        autoComplete="email"
                        className="bg-background border-primary/20 focus:border-primary focus:ring-primary/30 h-12"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 h-12"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className="flex-1 bg-primary hover:bg-primary/90 text-background font-semibold border-0 group h-12 disabled:opacity-50"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Mode (Project vs Maintenance) */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-5 pb-12"
                  >
                    <p className="text-sm text-muted-foreground">
                      Pick what you're booking — you can change it later.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("project");
                          // Smart defaults: pick Growth (best value) for project
                          setBudget(preset.budget && preset.budget !== "maintenance" ? preset.budget : "growth");
                          setProjectType(preset.projectType && preset.projectType !== "maintenance" ? preset.projectType : "web-app");
                        }}
                        className={cn(
                          "px-4 py-6 rounded-xl border text-left transition-all",
                          mode === "project"
                            ? "border-primary bg-primary/15 glow-cyan"
                            : "border-border bg-background hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-semibold">Book a Project</h3>
                          {mode === "project" && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-background" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Web apps, sites, Android apps, SEO, mods, bots, AI, automation.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("maintenance");
                          setBudget("request-a-fix");
                          setProjectType("maintenance");
                        }}
                        className={cn(
                          "px-4 py-6 rounded-xl border text-left transition-all",
                          mode === "maintenance"
                            ? "border-primary bg-primary/15 glow-cyan"
                            : "border-border bg-background hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-semibold">Maintenance</h3>
                          {mode === "maintenance" && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-background" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Request a Fix, Care Basic, or Care Complete plans.
                        </p>
                      </button>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 h-12"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="flex-1 bg-primary hover:bg-primary/90 text-background font-semibold border-0 group h-12"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Project type + Budget + Timeline (project mode) OR Budget only (maintenance mode) */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-5 pb-12"
                  >
                    {/* Project type — only for project mode, NOT maintenance */}
                    {mode === "project" && (
                      <div>
                        <Label className="text-sm font-medium text-foreground/90 mb-2 block">
                          What do you want built?
                        </Label>
                        <Select
                          key={`pt-${mode}-${step}`}
                          value={projectType}
                          onValueChange={setProjectType}
                        >
                          <SelectTrigger className="w-full bg-background border-primary/20 focus:border-primary focus:ring-primary/30 h-12">
                            <SelectValue placeholder="Pick one" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-primary/30 max-h-72" position="popper" sideOffset={4}>
                            {PROJECT_TYPES.map((pt) => (
                              <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Budget tier — shown in both modes, full width in maintenance mode */}
                    <div className={mode === "maintenance" ? "" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                      <div>
                        <Label className="text-sm font-medium text-foreground/90 mb-2 block">
                          {mode === "maintenance" ? "Maintenance plan" : "Budget tier"}
                        </Label>
                        <Select
                          key={`bd-${mode}-${step}`}
                          value={budget}
                          onValueChange={setBudget}
                        >
                          <SelectTrigger className="w-full bg-background border-primary/20 focus:border-primary focus:ring-primary/30 h-12">
                            <SelectValue placeholder="Pick one" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-primary/30" position="popper" sideOffset={4}>
                            {budgetOptions.map((b) => (
                              <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Timeline — only for project mode, NOT maintenance */}
                      {mode === "project" && (
                        <div>
                          <Label className="text-sm font-medium text-foreground/90 mb-2 block">
                            Timeline
                          </Label>
                          <Select key={`tl-${step}`} value={timeline} onValueChange={setTimeline}>
                            <SelectTrigger className="w-full bg-background border-primary/20 focus:border-primary focus:ring-primary/30 h-12">
                              <SelectValue placeholder="Pick one" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-primary/30" position="popper" sideOffset={4}>
                              {TIMELINES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 h-12"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className="flex-1 bg-primary hover:bg-primary/90 text-background font-semibold border-0 group h-12 disabled:opacity-50"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Brief */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="space-y-5 pb-12"
                  >
                    <div>
                      <Label htmlFor="bk-brief" className="text-sm font-medium text-foreground/90 mb-2 block">
                        Describe your project briefly
                      </Label>
                      <Textarea
                        id="bk-brief"
                        value={brief}
                        onChange={(e) => setBrief(e.target.value)}
                        rows={6}
                        placeholder={mode === "maintenance" ? "Describe the issue or what you need maintained" : "Describe your project briefly"}
                        className="bg-background border-primary/20 focus:border-primary focus:ring-primary/30 resize-none"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        {brief.length} characters · minimum 10
                      </p>
                    </div>

                    {/* Summary card — IKEA effect: user sees what they've built */}
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <p className="text-[11px] font-mono uppercase text-primary mb-2">Your booking summary</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Name:</span> {name}</div>
                        <div><span className="text-muted-foreground">Email:</span> {email}</div>
                        <div><span className="text-muted-foreground">Type:</span> {mode === "maintenance" ? "Maintenance" : "Project"}</div>
                        {mode === "project" && projectType && (
                          <div><span className="text-muted-foreground">Build:</span> {PROJECT_TYPES.find(pt => pt.value === projectType)?.label}</div>
                        )}
                        <div><span className="text-muted-foreground">{mode === "maintenance" ? "Plan:" : "Tier:"}</span> {budgetOptions.find(b => b.value === budget)?.label}</div>
                        {mode === "project" && timeline && (
                          <div><span className="text-muted-foreground">Timeline:</span> {TIMELINES.find(t => t.value === timeline)?.label}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={submitting}
                        className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 h-12"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        onClick={submitEnquiry}
                        disabled={!canProceed() || submitting}
                        className="flex-1 bg-primary hover:bg-primary/90 text-background font-semibold border-0 group h-12 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending
                          </>
                        ) : (
                          <>
                            {mode === "maintenance" ? "Send Maintenance Enquiry" : "Send Project Enquiry"}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Done */}
                {step === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="flex flex-col items-center justify-center text-center py-16"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/40 text-primary mb-6 glow-cyan-strong"
                    >
                      <CheckCircle2 className="h-10 w-10" />
                    </motion.div>
                    <h3 className="text-2xl font-semibold mb-2">Thanks — we'll reply within 24 hours.</h3>
                    <p className="text-muted-foreground mb-8 max-w-md">
                      Your enquiry is in, {name}. The team will follow up with a written brief, cost range, and demo timeline.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                      <Button
                        asChild
                        className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white border-0"
                      >
                        <a href="https://discord.gg/VhKgEetwr8" target="_blank" rel="noopener noreferrer">
                          <DiscordLogo className="mr-2 h-4 w-4" />
                          Join Discord
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={closeBooking}
                        className="flex-1 border-primary/30 text-primary/80 hover:bg-primary/10"
                      >
                        Close
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
