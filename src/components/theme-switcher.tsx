"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Theme {
  id: string;
  name: string;
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  { id: "cyan", name: "Cyan", vars: { "--background": "#0A1830", "--card": "#0F2147", "--primary": "#22D3EE", "--accent": "#3B82F6", "--border": "rgba(34, 211, 238, 0.25)", "--brand-cyan": "#22D3EE", "--brand-blue": "#3B82F6" } },
  { id: "purple", name: "Purple", vars: { "--background": "#0D0A1A", "--card": "#1A0F2E", "--primary": "#A855F7", "--accent": "#7C3AED", "--border": "rgba(168, 85, 247, 0.25)", "--brand-cyan": "#A855F7", "--brand-blue": "#7C3AED" } },
  { id: "emerald", name: "Emerald", vars: { "--background": "#051A14", "--card": "#0A2B20", "--primary": "#10B981", "--accent": "#059669", "--border": "rgba(16, 185, 129, 0.25)", "--brand-cyan": "#10B981", "--brand-blue": "#059669" } },
  { id: "orange", name: "Orange", vars: { "--background": "#1A0F05", "--card": "#2B1A0A", "--primary": "#F97316", "--accent": "#EA580C", "--border": "rgba(249, 115, 22, 0.25)", "--brand-cyan": "#F97316", "--brand-blue": "#EA580C" } },
  { id: "rose", name: "Rose", vars: { "--background": "#1A0510", "--card": "#2B0A1A", "--primary": "#F43F5E", "--accent": "#E11D48", "--border": "rgba(244, 63, 94, 0.25)", "--brand-cyan": "#F43F5E", "--brand-blue": "#E11D48" } },
  { id: "amber", name: "Amber", vars: { "--background": "#1A1405", "--card": "#2B220A", "--primary": "#F59E0B", "--accent": "#D97706", "--border": "rgba(245, 158, 11, 0.25)", "--brand-cyan": "#F59E0B", "--brand-blue": "#D97706" } },
  { id: "indigo", name: "Indigo", vars: { "--background": "#0A0A1F", "--card": "#14142B", "--primary": "#6366F1", "--accent": "#4F46E5", "--border": "rgba(99, 102, 241, 0.25)", "--brand-cyan": "#6366F1", "--brand-blue": "#4F46E5" } },
  { id: "teal", name: "Teal", vars: { "--background": "#051A1A", "--card": "#0A2B2B", "--primary": "#14B8A6", "--accent": "#0D9488", "--border": "rgba(20, 184, 166, 0.25)", "--brand-cyan": "#14B8A6", "--brand-blue": "#0D9488" } },
  { id: "pink", name: "Pink", vars: { "--background": "#1A0514", "--card": "#2B0A20", "--primary": "#EC4899", "--accent": "#DB2777", "--border": "rgba(236, 72, 153, 0.25)", "--brand-cyan": "#EC4899", "--brand-blue": "#DB2777" } },
  { id: "lime", name: "Lime", vars: { "--background": "#0F1A05", "--card": "#1A2B0A", "--primary": "#84CC16", "--accent": "#65A30D", "--border": "rgba(132, 204, 22, 0.25)", "--brand-cyan": "#84CC16", "--brand-blue": "#65A30D" } },
  { id: "sky", name: "Sky", vars: { "--background": "#05101A", "--card": "#0A1F2B", "--primary": "#0EA5E9", "--accent": "#0284C7", "--border": "rgba(14, 165, 233, 0.25)", "--brand-cyan": "#0EA5E9", "--brand-blue": "#0284C7" } },
  { id: "violet", name: "Violet", vars: { "--background": "#10051A", "--card": "#1F0A2B", "--primary": "#8B5CF6", "--accent": "#7C3AED", "--border": "rgba(139, 92, 246, 0.25)", "--brand-cyan": "#8B5CF6", "--brand-blue": "#7C3AED" } },
  { id: "red", name: "Red", vars: { "--background": "#1A0505", "--card": "#2B0A0A", "--primary": "#EF4444", "--accent": "#DC2626", "--border": "rgba(239, 68, 68, 0.25)", "--brand-cyan": "#EF4444", "--brand-blue": "#DC2626" } },
  { id: "fuchsia", name: "Fuchsia", vars: { "--background": "#1A0514", "--card": "#2B0A1F", "--primary": "#D946EF", "--accent": "#C026D3", "--border": "rgba(217, 70, 239, 0.25)", "--brand-cyan": "#D946EF", "--brand-blue": "#C026D3" } },
  { id: "blue", name: "Blue", vars: { "--background": "#050A1A", "--card": "#0A142B", "--primary": "#3B82F6", "--accent": "#2563EB", "--border": "rgba(59, 130, 246, 0.25)", "--brand-cyan": "#3B82F6", "--brand-blue": "#2563EB" } },
  { id: "gold", name: "Gold", vars: { "--background": "#1A1405", "--card": "#2B220A", "--primary": "#EAB308", "--accent": "#CA8A04", "--border": "rgba(234, 179, 8, 0.25)", "--brand-cyan": "#EAB308", "--brand-blue": "#CA8A04" } },
  { id: "crimson", name: "Crimson", vars: { "--background": "#140505", "--card": "#240A0A", "--primary": "#DC143C", "--accent": "#B91C1C", "--border": "rgba(220, 20, 60, 0.25)", "--brand-cyan": "#DC143C", "--brand-blue": "#B91C1C" } },
  { id: "mint", name: "Mint", vars: { "--background": "#051A10", "--card": "#0A2B18", "--primary": "#34D399", "--accent": "#10B981", "--border": "rgba(52, 211, 153, 0.25)", "--brand-cyan": "#34D399", "--brand-blue": "#10B981" } },
  { id: "coral", name: "Coral", vars: { "--background": "#1A0A05", "--card": "#2B140A", "--primary": "#FF7F50", "--accent": "#E0633A", "--border": "rgba(255, 127, 80, 0.25)", "--brand-cyan": "#FF7F50", "--brand-blue": "#E0633A" } },
  { id: "slate", name: "Slate", vars: { "--background": "#0A0A0F", "--card": "#14141F", "--primary": "#64748B", "--accent": "#475569", "--border": "rgba(100, 116, 139, 0.25)", "--brand-cyan": "#64748B", "--brand-blue": "#475569" } },
  { id: "aqua", name: "Aqua", vars: { "--background": "#05141A", "--card": "#0A242E", "--primary": "#00E5FF", "--accent": "#00B8D4", "--border": "rgba(0, 229, 255, 0.25)", "--brand-cyan": "#00E5FF", "--brand-blue": "#00B8D4" } },
  { id: "lavender", name: "Lavender", vars: { "--background": "#0F0A1A", "--card": "#1A122B", "--primary": "#B19CD9", "--accent": "#9B7EBD", "--border": "rgba(177, 156, 217, 0.25)", "--brand-cyan": "#B19CD9", "--brand-blue": "#9B7EBD" } },
  { id: "forest", name: "Forest", vars: { "--background": "#0A1A0A", "--card": "#142B14", "--primary": "#228B22", "--accent": "#006400", "--border": "rgba(34, 139, 34, 0.25)", "--brand-cyan": "#228B22", "--brand-blue": "#006400" } },
  { id: "sunset", name: "Sunset", vars: { "--background": "#1A0A05", "--card": "#2B1208", "--primary": "#FF6B35", "--accent": "#E85D04", "--border": "rgba(255, 107, 53, 0.25)", "--brand-cyan": "#FF6B35", "--brand-blue": "#E85D04" } },
  { id: "magenta", name: "Magenta", vars: { "--background": "#1A0514", "--card": "#2B0A1F", "--primary": "#FF00FF", "--accent": "#CC00CC", "--border": "rgba(255, 0, 255, 0.25)", "--brand-cyan": "#FF00FF", "--brand-blue": "#CC00CC" } },
  { id: "turquoise", name: "Turquoise", vars: { "--background": "#051A1A", "--card": "#0A2B2B", "--primary": "#40E0D0", "--accent": "#00CED1", "--border": "rgba(64, 224, 208, 0.25)", "--brand-cyan": "#40E0D0", "--brand-blue": "#00CED1" } },
  { id: "bronze", name: "Bronze", vars: { "--background": "#1A140A", "--card": "#2B220F", "--primary": "#CD7F32", "--accent": "#B8860B", "--border": "rgba(205, 127, 50, 0.25)", "--brand-cyan": "#CD7F32", "--brand-blue": "#B8860B" } },
  { id: "platinum", name: "Platinum", vars: { "--background": "#0F0F0F", "--card": "#1A1A1A", "--primary": "#E5E4E2", "--accent": "#B8B8B8", "--border": "rgba(229, 228, 226, 0.25)", "--brand-cyan": "#E5E4E2", "--brand-blue": "#B8B8B8" } },
  { id: "spring", name: "Spring", vars: { "--background": "#0F1A05", "--card": "#1A2B0A", "--primary": "#9ACD32", "--accent": "#7FB317", "--border": "rgba(154, 205, 50, 0.25)", "--brand-cyan": "#9ACD32", "--brand-blue": "#7FB317" } },
  { id: "ocean", name: "Ocean", vars: { "--background": "#05101A", "--card": "#0A1F2B", "--primary": "#1E90FF", "--accent": "#0066CC", "--border": "rgba(30, 144, 255, 0.25)", "--brand-cyan": "#1E90FF", "--brand-blue": "#0066CC" } },
  { id: "burgundy", name: "Burgundy", vars: { "--background": "#140505", "--card": "#240A0A", "--primary": "#800020", "--accent": "#5C0011", "--border": "rgba(128, 0, 32, 0.25)", "--brand-cyan": "#800020", "--brand-blue": "#5C0011" } },
  { id: "saffron", name: "Saffron", vars: { "--background": "#1A1405", "--card": "#2B2208", "--primary": "#FF9933", "--accent": "#E08020", "--border": "rgba(255, 153, 51, 0.25)", "--brand-cyan": "#FF9933", "--brand-blue": "#E08020" } },
  { id: "ice", name: "Ice", vars: { "--background": "#0A1014", "--card": "#141F28", "--primary": "#B0E0E6", "--accent": "#87CEEB", "--border": "rgba(176, 224, 230, 0.25)", "--brand-cyan": "#B0E0E6", "--brand-blue": "#87CEEB" } },
  { id: "plum", name: "Plum", vars: { "--background": "#10051A", "--card": "#1F0A2B", "--primary": "#8E4585", "--accent": "#6A2E5C", "--border": "rgba(142, 69, 133, 0.25)", "--brand-cyan": "#8E4585", "--brand-blue": "#6A2E5C" } },
  { id: "sand", name: "Sand", vars: { "--background": "#1A160A", "--card": "#2B240F", "--primary": "#C2B280", "--accent": "#A89B6C", "--border": "rgba(194, 178, 128, 0.25)", "--brand-cyan": "#C2B280", "--brand-blue": "#A89B6C" } },
  { id: "electric", name: "Electric", vars: { "--background": "#0A0014", "--card": "#14001F", "--primary": "#7DF9FF", "--accent": "#00FFFF", "--border": "rgba(125, 249, 255, 0.25)", "--brand-cyan": "#7DF9FF", "--brand-blue": "#00FFFF" } },
  { id: "olive", name: "Olive", vars: { "--background": "#0F1405", "--card": "#1A240A", "--primary": "#808000", "--accent": "#6B6B00", "--border": "rgba(128, 128, 0, 0.25)", "--brand-cyan": "#808000", "--brand-blue": "#6B6B00" } },
  { id: "copper", name: "Copper", vars: { "--background": "#1A0F05", "--card": "#2B1A0A", "--primary": "#B87333", "--accent": "#9C5C1E", "--border": "rgba(184, 115, 51, 0.25)", "--brand-cyan": "#B87333", "--brand-blue": "#9C5C1E" } },
  { id: "midnight", name: "Midnight", vars: { "--background": "#05051A", "--card": "#0A0A2B", "--primary": "#191970", "--accent": "#000080", "--border": "rgba(25, 25, 112, 0.25)", "--brand-cyan": "#191970", "--brand-blue": "#000080" } },
  { id: "neon", name: "Neon", vars: { "--background": "#050014", "--card": "#0A001F", "--primary": "#39FF14", "--accent": "#00FF00", "--border": "rgba(57, 255, 20, 0.25)", "--brand-cyan": "#39FF14", "--brand-blue": "#00FF00" } },
];

export function ThemeSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState("cyan");
  const [rgbActive, setRgbActive] = React.useState(false);
  const [cycleActive, setCycleActive] = React.useState(false);
  const rgbInterval = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleInterval = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const applyRGB = (hue: number) => {
    const root = document.documentElement;
    const primary = `hsl(${hue}, 85%, 60%)`;
    const accent = `hsl(${(hue + 60) % 360}, 80%, 55%)`;
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--brand-cyan", primary);
    root.style.setProperty("--brand-blue", accent);
    root.style.setProperty("--border", `hsla(${hue}, 85%, 60%, 0.25)`);
    root.style.setProperty("--ring", primary);
    root.style.setProperty("--sidebar-primary", primary);
    root.style.setProperty("--sidebar-ring", primary);
    root.style.setProperty("--input", `hsla(${hue}, 85%, 60%, 0.12)`);
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    // Set the theme's own vars
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    // Derive ALL missing variables from the theme's main colors
    // This ensures EVERY element on the page changes color
    const bg = theme.vars["--background"];
    const card = theme.vars["--card"];
    const primary = theme.vars["--primary"];
    const accent = theme.vars["--accent"];
    if (bg) {
      root.style.setProperty("--secondary", card || bg);
      root.style.setProperty("--muted", card || bg);
      root.style.setProperty("--popover", card || bg);
      root.style.setProperty("--sidebar", bg);
      root.style.setProperty("--sidebar-accent", card || bg);
      root.style.setProperty("--primary-foreground", bg);
      root.style.setProperty("--accent-foreground", bg);
      root.style.setProperty("--sidebar-primary", primary);
      root.style.setProperty("--sidebar-primary-foreground", bg);
      root.style.setProperty("--sidebar-border", theme.vars["--border"] || "");
      root.style.setProperty("--sidebar-ring", primary);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--input", `color-mix(in srgb, ${primary} 12%, transparent)`);
    }
    setActive(theme.id);
    document.documentElement.classList.remove("rgb-mode");
    setRgbActive(false);
    if (rgbInterval.current) { cancelAnimationFrame(rgbInterval.current as unknown as number); rgbInterval.current = null; }
    if (cycleInterval.current) { clearInterval(cycleInterval.current); cycleInterval.current = null; setCycleActive(false); }
    try { localStorage.setItem("qf-theme", theme.id); } catch {}
  };

  const toggleRGB = () => {
    if (rgbActive) {
      // Turn off — remove the CSS class and reset
      document.documentElement.classList.remove("rgb-mode");
      setRgbActive(false);
      applyTheme(THEMES.find((t) => t.id === "cyan")!);
    } else {
      // Turn on — add CSS class that triggers GPU-accelerated hue-rotate animation
      document.documentElement.classList.add("rgb-mode");
      setRgbActive(true);
      if (cycleInterval.current) { clearInterval(cycleInterval.current); cycleInterval.current = null; setCycleActive(false); }
    }
  };

  const toggleCycle = () => {
    if (cycleInterval.current) {
      clearInterval(cycleInterval.current);
      cycleInterval.current = null;
      setCycleActive(false);
    } else {
      setCycleActive(true);
      if (rgbInterval.current) { cancelAnimationFrame(rgbInterval.current as unknown as number); rgbInterval.current = null; setRgbActive(false); }
      let idx = THEMES.findIndex((t) => t.id === active);
      cycleInterval.current = setInterval(() => {
        idx = (idx + 1) % THEMES.length;
        const root = document.documentElement;
        Object.entries(THEMES[idx].vars).forEach(([key, val]) => {
          root.style.setProperty(key, val);
          // Add transition for smooth 0.5s color change
          root.style.transition = "background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease";
        });
        setActive(THEMES[idx].id);
      }, 7000);
    }
  };

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("qf-theme");
      if (saved) {
        const theme = THEMES.find((t) => t.id === saved);
        if (theme) applyTheme(theme);
      }
    } catch {}
  }, []);

  const activeTheme = THEMES.find((t) => t.id === active);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center border border-border rounded-md hover:bg-muted transition-colors"
        aria-label="Change theme"
        title={`Theme: ${activeTheme?.name || "Cyan"}`}
      >
        <div
          className="h-5 w-5 rounded-full border border-border"
          style={{
            background: rgbActive
              ? "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000)"
              : cycleActive
              ? "conic-gradient(from 0deg, #22D3EE, #A855F7, #10B981, #F97316, #F43F5E, #22D3EE)"
              : activeTheme?.vars["--primary"] || "#22D3EE",
          }}
        />
      </button>

      {/* Full-screen theme popup — like hamburger menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-background/60"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 right-0 z-50 bg-background/98 border-b border-primary/30 shadow-2xl"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <div className="flex items-center justify-between px-5 sm:px-8 h-14 border-b border-border">
                <span className="text-lg font-semibold tracking-tight">Color themes</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="inline-flex h-9 w-9 items-center justify-center border border-border rounded-md hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 sm:px-8 py-5">
                {/* RGB + Cycle buttons as special color circles */}
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-5">
                  {/* RGB button — has the RGB gradient effect on the button itself */}
                  <button
                    onClick={toggleRGB}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors",
                      rgbActive ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div
                      className="h-10 w-10 rounded-full border-2"
                      style={{
                        background: "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000)",
                        animation: "spin 3s linear infinite",
                        borderColor: rgbActive ? "white" : "transparent",
                      }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">RGB</span>
                    {rgbActive && <Check className="h-3 w-3 text-primary" />}
                  </button>

                  {/* Cycle button — all colors split in a circle */}
                  <button
                    onClick={toggleCycle}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors",
                      cycleActive ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div
                      className="h-10 w-10 rounded-full border-2"
                      style={{
                        background: "conic-gradient(#22D3EE, #A855F7, #10B981, #F97316, #F43F5E, #3B82F6, #EAB308, #EC4899, #22D3EE)",
                        borderColor: cycleActive ? "white" : "transparent",
                      }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">Cycle</span>
                    {cycleActive && <Check className="h-3 w-3 text-primary" />}
                  </button>

                  {/* All 40 themes */}
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => applyTheme(theme)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors",
                        active === theme.id && !rgbActive && !cycleActive ? "bg-primary/10" : "hover:bg-muted/50"
                      )}
                      title={theme.name}
                    >
                      <div
                        className="h-10 w-10 rounded-full border-2"
                        style={{
                          background: theme.vars["--primary"],
                          borderColor: active === theme.id && !rgbActive && !cycleActive ? "white" : "transparent",
                        }}
                      />
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {theme.name}
                      </span>
                      {active === theme.id && !rgbActive && !cycleActive && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
