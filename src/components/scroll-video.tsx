"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

/**
 * ScrollVideo — scroll-driven frame-by-frame video playback.
 *
 * Loads a sequence of PNG frames (extracted from the hero video) and draws
 * them to a <canvas> based on scroll position. The canvas is pinned with
 * position: sticky while the user scrolls through ~5 viewport heights,
 * during which the 299 frames play through.
 *
 * Auto-selects resolution based on Network Information API + viewport:
 *  - 1440p (high wifi, downlink > 10)
 *  - 1080p (default)
 *  - 720p (low wifi, downlink < 2)
 *
 * Auto-selects orientation based on viewport width:
 *  - desktop (16:9) when width >= 1024
 *  - mobile (9:16) when width < 1024
 */

const TOTAL_FRAMES = 299;

type Resolution = "1440p" | "1080p" | "720p";
type Orientation = "desktop" | "mobile";

function detectResolution(): Resolution {
  if (typeof navigator === "undefined") return "1080p";
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn) {
    const effectiveType = conn.effectiveType;
    const downlink = conn.downlink;
    if (effectiveType === "4g" && downlink > 10) return "1440p";
    if (effectiveType === "3g" || effectiveType === "2g" || (downlink && downlink < 2)) return "720p";
  }
  return "1080p";
}

function detectOrientation(): Orientation {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth >= 1024 ? "desktop" : "mobile";
}

function getFramePath(orientation: Orientation, resolution: Resolution, frame: number): string {
  const padded = String(frame).padStart(3, "0");
  return `/videos/${orientation}-${resolution}/frame-${padded}.png`;
}

export function ScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [resolution] = useState<Resolution>(detectResolution);
  const [orientation, setOrientation] = useState<Orientation>(detectOrientation);
  const currentFrameRef = useRef(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Debug: log scroll progress
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (p: number) => {
      if (typeof window !== "undefined") {
        (window as any).__scrollProgress = p;
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Update orientation on resize
  useEffect(() => {
    const onResize = () => {
      const newOrientation = detectOrientation();
      if (newOrientation !== orientation) {
        setOrientation(newOrientation);
        setLoaded(0);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [orientation]);

  // Preload all frames
  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    imagesRef.current = images;
    let loadedCount = 0;

    const preloadBatch = async (start: number, count: number) => {
      const promises: Promise<void>[] = [];
      for (let i = start; i < start + count && i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(orientation, resolution, i);
        images[i - 1] = img;
        promises.push(
          new Promise<void>((resolve) => {
            img.onload = () => {
              if (!cancelled) {
                loadedCount++;
                setLoaded(loadedCount);
              }
              resolve();
            };
            img.onerror = () => {
              loadedCount++;
              setLoaded(loadedCount);
              resolve();
            };
          })
        );
      }
      await Promise.all(promises);
    };

    // Preload in batches of 30 for memory efficiency
    (async () => {
      for (let i = 1; i <= TOTAL_FRAMES; i += 30) {
        if (cancelled) break;
        await preloadBatch(i, 30);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orientation, resolution]);

  // Draw frame based on scroll progress
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = (frameNum: number) => {
      const img = imagesRef.current[frameNum - 1];
      if (!img || !img.complete) return;

      const w = canvas.width;
      const h = canvas.height;
      const imgAspect = img.width / img.height;
      const canvasAspect = w / h;

      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (imgAspect > canvasAspect) {
        // Image wider than canvas — fit to width
        drawW = w;
        drawH = w / imgAspect;
        drawX = 0;
        drawY = (h - drawH) / 2;
      } else {
        // Image taller than canvas — fit to height
        drawH = h;
        drawW = h * imgAspect;
        drawX = (w - drawW) / 2;
        drawY = 0;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };

    // Set canvas size to match display
    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      ctx.scale(dpr, dpr);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Scroll-driven frame update
    const unsubscribe = scrollYProgress.on("change", (progress: number) => {
      const frame = Math.max(1, Math.min(TOTAL_FRAMES, Math.ceil(progress * TOTAL_FRAMES)));
      if (frame !== currentFrameRef.current) {
        currentFrameRef.current = frame;
        drawFrame(frame);
      }
    });

    // Draw first frame
    drawFrame(1);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [scrollYProgress, loaded]);

  const progress = (loaded / TOTAL_FRAMES) * 100;

  return (
    <div ref={containerRef} style={{ height: "500vh", position: "relative" }}>
      {/* Sticky canvas container */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Edge fade mask — blends video into page background */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(10, 24, 48, 0.4) 80%, rgba(10, 24, 48, 0.85) 100%)",
          }}
        />

        {/* Preloader */}
        {loaded < TOTAL_FRAMES && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0A1830",
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--primary)",
                  marginBottom: "1rem",
                }}
              >
                QuackForge
              </div>
              <div
                style={{
                  width: "200px",
                  height: "2px",
                  background: "rgba(34, 211, 238, 0.2)",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, var(--primary), var(--accent))",
                    width: `${progress}%`,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--muted-foreground)",
                  marginTop: "0.5rem",
                }}
              >
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}

        {/* Text overlays — added via code, not in video */}
        <ScrollOverlays scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}

/**
 * ScrollOverlays — glass-effect text overlays that fade in/out based on scroll.
 * 5 sections, each ~20% of scroll.
 */
function ScrollOverlays({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Section 1: Hero (0-20%) — visible immediately at scroll 0
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // Section 2: Code editor (20-40%)
  const codeOpacity = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);

  // Section 3: Stack (40-60%)
  const stackOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.55, 0.6], [0, 1, 1, 0]);

  // Section 4: Team (60-80%)
  const teamOpacity = useTransform(scrollYProgress, [0.6, 0.65, 0.75, 0.8], [0, 1, 1, 0]);

  // Section 5: CTA (80-100%)
  const ctaOpacity = useTransform(scrollYProgress, [0.8, 0.85, 0.95, 1], [0, 1, 1, 0]);

  return (
    <>
      {/* Section 1: Hero headline */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="text-center px-6">
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight leading-[0.98]"
            style={{
              textShadow: "0 4px 30px rgba(10, 24, 48, 0.8)",
            }}
          >
            <span className="text-foreground">Full-stack dev,</span>
            <br />
            <span className="text-gradient-cyan">forged for speed.</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-base sm:text-lg lg:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed"
            style={{ textShadow: "0 2px 20px rgba(10, 24, 48, 0.9)" }}
          >
            We build websites, mobile apps, and SEO systems that help your
            business grow.{" "}
            <span className="text-primary font-medium">
              Your first demo is free and ready in 48 hours.
            </span>
          </motion.p>
        </div>
      </motion.div>

      {/* Section 2: Code editor mockup */}
      <motion.div
        style={{ opacity: codeOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="text-center px-6 max-w-2xl">
          <div
            className="inline-block px-6 py-4 rounded-xl backdrop-blur-md"
            style={{
              background: "rgba(15, 33, 71, 0.4)",
              border: "1px solid rgba(34, 211, 238, 0.3)",
            }}
          >
            <p className="font-mono text-xs sm:text-sm text-primary/80 mb-2">$ quackforge init my-project</p>
            <p className="font-mono text-xs sm:text-sm text-foreground/70">→ Scaffolding Next.js 16 + TypeScript + Tailwind 4…</p>
            <p className="font-mono text-xs sm:text-sm text-foreground/70">→ Installing 60+ dependencies (Bun)…</p>
            <p className="font-mono text-xs sm:text-sm text-green-400">✓ Project ready in 8.2s</p>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Tech stack */}
      <motion.div
        style={{ opacity: stackOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="text-center px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
            The stack <span className="text-gradient-cyan">we ship.</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 max-w-3xl mx-auto">
            {["Next.js 16", "TypeScript", "Tailwind 4", "Kotlin", "Java", "Gradle", "Material 3", "Python", "Node.js", "Firebase", "Prisma", "Cloudflare", "Google OAuth", "Stripe", "REST APIs", "Discord.js", "OpenAI", "Claude", "Gemini", "Forge", "Lighthouse", "Schema.org", "GA4", "Vercel"].map((tech, i) => (
              <div
                key={tech}
                className="px-2 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs text-foreground/80"
                style={{
                  background: "rgba(15, 33, 71, 0.5)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(34, 211, 238, 0.2)",
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section 4: Team */}
      <motion.div
        style={{ opacity: teamOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="text-center px-6 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
            Who <span className="text-gradient-cyan">builds it.</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title: "Lead Development", body: "Architecture, code quality, technical decisions." },
              { title: "Design & Frontend", body: "The interface users touch. Built to convert." },
              { title: "Backend & Infra", body: "Servers, databases, deployments, security." },
              { title: "Client Success", body: "One point of contact, first call to post-launch." },
            ].map((role) => (
              <div
                key={role.title}
                className="p-4 rounded-xl backdrop-blur-md text-left"
                style={{
                  background: "rgba(15, 33, 71, 0.4)",
                  border: "1px solid rgba(34, 211, 238, 0.25)",
                }}
              >
                <h3 className="text-sm font-semibold mb-2 text-foreground">{role.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{role.body}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section 5: CTA */}
      <motion.div
        style={{ opacity: ctaOpacity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-center px-6">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
            Tell us what to <span className="text-gradient-cyan">build.</span>
          </h2>
          <p className="text-base sm:text-lg text-foreground/80 max-w-xl mx-auto mb-8">
            Pick a plan, share your idea, and our team will get back to you
            within 24 hours. Your first demo is free.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:scale-105 pulse-glow"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              color: "var(--background)",
              boxShadow: "0 8px 32px -4px rgba(34, 211, 238, 0.6)",
            }}
          >
            Book a Project
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </motion.div>
    </>
  );
}
