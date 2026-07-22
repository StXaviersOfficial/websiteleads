"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion-primitives";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useBooking } from "@/hooks/use-booking";
import { cn } from "@/lib/utils";
import { DiscordLogo } from "@/components/discord-fab";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "#services", label: "Services" },
  { href: "#pricing", label: "Pricing" },
  { href: "#maintenance", label: "Care Plans" },
  { href: "#team", label: "Team" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { openBooking } = useBooking();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-colors duration-300",
          scrolled && !open
            ? "bg-background/95 border-b border-border"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <nav className="flex h-20 items-center justify-between">
            <Link
              href="#top"
              className="flex items-center gap-3 group"
              aria-label="QuackForge home"
            >
              <div className="relative">
                <img
                  src="/quackforge-logo.png"
                  alt=""
                  className="h-11 w-11 rounded-lg object-cover ring-1 ring-primary/40 transition-all duration-300 group-hover:ring-primary group-hover:scale-105"
                  width={44}
                  height={44}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-lg bg-primary/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                Quack<span className="text-gradient-cyan">Forge</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground link-underline transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Magnetic strength={0.3}>
                <Button
                  onClick={() => openBooking({})}
                  className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-background font-semibold border-0 group pulse-glow h-10"
                >
                  Book a Project
                </Button>
              </Magnetic>
              <Magnetic strength={0.3}>
                <a
                  href="https://discord.gg/VhKgEetwr8"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our Discord server"
                  className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#5865F2] hover:bg-[#4752C4] text-white transition-colors"
                >
                  <DiscordLogo className="h-5 w-5" />
                </a>
              </Magnetic>
              {/* Theme switcher — always visible, compact, right before hamburger */}
              <ThemeSwitcher />
              <button
                className="lg:hidden inline-flex h-10 w-10 items-center justify-center border border-border rounded-md hover:bg-muted bg-background/80"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu — half-screen from very top, overrides logo */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop to catch outside clicks */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-background/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 right-0 z-50 bg-background/98 border-b border-primary/30 shadow-2xl"
              style={{ height: "auto", maxHeight: "55vh" }}
            >
            {/* Top bar — close button on right, no empty space */}
            <div className="flex items-center justify-between px-5 sm:px-8 h-14 border-b border-border">
              <span className="text-lg font-semibold tracking-tight">
                Quack<span className="text-gradient-cyan">Forge</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center border border-border rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu items — no scroll, compact */}
            <div
              className="px-5 sm:px-8 py-3 flex flex-col gap-0"
              onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
              }}
            >
              <nav className="flex flex-col gap-0">
                {NAV.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i + 0.1, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="px-4 py-2.5 text-base font-semibold tracking-tight text-foreground hover:text-primary transition-colors border-b border-border/30"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="mt-4 flex flex-col gap-2"
              >
                <Button
                  onClick={() => {
                    setOpen(false);
                    openBooking({});
                  }}
                  className="bg-primary hover:bg-primary/90 text-background font-semibold pulse-glow h-12 text-base"
                >
                  Book a Project
                </Button>
                <a
                  href="https://discord.gg/VhKgEetwr8"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-md h-12"
                >
                  <DiscordLogo className="h-5 w-5" />
                  Join Discord
                </a>
              </motion.div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
