"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Terminal } from "lucide-react";

/**
 * HeroCodeEditor — animated code editor mockup for the hero section.
 *
 * Cycles through a sequence of "developer actions" (typing code, running
 * commands, deploying) to give the hero section motion without a video file.
 *
 * No external assets — pure React + Framer Motion + CSS.
 */

type Line = {
  text: string;
  type: "command" | "output" | "code" | "success" | "comment";
  delay?: number;
};

const SEQUENCE: Line[] = [
  { text: "$ quackforge init my-project", type: "command" },
  { text: "→ Scaffolding Next.js 16 + TypeScript + Tailwind 4…", type: "output", delay: 200 },
  { text: "→ Installing 60+ dependencies (Bun)…", type: "output", delay: 300 },
  { text: "✓ Project ready in 8.2s", type: "success", delay: 400 },
  { text: "", type: "output", delay: 200 },
  { text: "$ quackforge ship --tier growth", type: "command", delay: 400 },
  { text: "// src/app/page.tsx", type: "comment", delay: 200 },
  { text: "export default function Home() {", type: "code", delay: 100 },
  { text: "  return <Hero /> <Pricing /> <Contact />", type: "code", delay: 150 },
  { text: "}", type: "code", delay: 100 },
  { text: "", type: "output", delay: 200 },
  { text: "→ Building standalone output…", type: "output", delay: 300 },
  { text: "→ Deploying to Vercel…", type: "output", delay: 400 },
  { text: "✓ Live at https://my-project.vercel.app", type: "success", delay: 400 },
  { text: "✓ Custom domain attached (my-project.dev)", type: "success", delay: 300 },
  { text: "✓ SEO sitemap submitted to Google", type: "success", delay: 300 },
  { text: "", type: "output", delay: 300 },
  { text: "$ quackforge ship --tier growth", type: "command", delay: 800 },
];

export function HeroCodeEditor() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Subtle 3D tilt that follows mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 4, y: dx * 4 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  useEffect(() => {
    if (visibleLines >= SEQUENCE.length) {
      // Reset after a pause
      const reset = setTimeout(() => {
        setVisibleLines(0);
        setCharIndex(0);
      }, 4000);
      return () => clearTimeout(reset);
    }

    const currentLine = SEQUENCE[visibleLines];
    const fullText = currentLine.text;

    if (charIndex < fullText.length) {
      // Type next character
      const speed = currentLine.type === "command" ? 45 : currentLine.type === "code" ? 25 : 8;
      const t = setTimeout(() => setCharIndex(charIndex + 1), speed);
      return () => clearTimeout(t);
    }

    // Line complete — move to next after delay
    const delay = currentLine.delay ?? 250;
    const t = setTimeout(() => {
      setVisibleLines(visibleLines + 1);
      setCharIndex(0);
    }, delay);
    return () => clearTimeout(t);
  }, [visibleLines, charIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[480px] mx-auto aspect-[4/3] rounded-2xl border border-primary/30 bg-card/80 backdrop-blur shadow-2xl overflow-hidden"
      style={{
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
        boxShadow: "0 20px 60px -15px rgba(34,211,238,0.35), 0 0 0 1px rgba(34,211,238,0.12)",
      }}
    >
      {/* Editor title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-background/40">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground">
          <Terminal className="h-3 w-3" />
          <span>quackforge — bash</span>
        </div>
      </div>

      {/* Editor body */}
      <div className="p-4 h-[calc(100%-44px)] overflow-hidden font-mono text-[12px] leading-relaxed">
        {SEQUENCE.slice(0, visibleLines).map((line, i) => (
          <LineRenderer key={i} line={line} />
        ))}
        {visibleLines < SEQUENCE.length && (
          <LineRenderer
            line={{
              ...SEQUENCE[visibleLines],
              text: SEQUENCE[visibleLines].text.slice(0, charIndex),
            }}
            showCursor
          />
        )}
      </div>

      {/* Glow accent at bottom */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(to right, transparent, var(--primary), transparent)",
          opacity: 0.6,
        }}
      />
    </motion.div>
  );
}

function LineRenderer({ line, showCursor = false }: { line: Line; showCursor?: boolean }) {
  let className = "text-foreground/90";
  let prefix = "";

  switch (line.type) {
    case "command":
      className = "text-primary/90 font-medium";
      break;
    case "output":
      className = "text-muted-foreground";
      break;
    case "code":
      className = "text-foreground/80";
      break;
    case "success":
      className = "text-green-400";
      prefix = "  ";
      break;
    case "comment":
      className = "text-muted-foreground/60 italic";
      break;
  }

  return (
    <div className={className}>
      {prefix}
      {line.text}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block w-2 h-3 bg-primary ml-0.5 align-middle"
        />
      )}
      {line.type === "success" && line.text.startsWith("✓") && (
        <Check className="inline-block h-3 w-3 ml-1 -mt-0.5" />
      )}
    </div>
  );
}
