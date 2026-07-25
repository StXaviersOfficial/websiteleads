"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StaggerGroup,
  FadeUp,
  Magnetic,
  TextReveal,
  Counter,
} from "@/components/motion-primitives";
import { useBooking } from "@/hooks/use-booking";
import { HeroCodeEditor } from "@/components/sections/hero-code-editor";

export function Hero() {
  const { openBooking } = useBooking();

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-32 pb-12 sm:pt-36 sm:pb-16 min-h-[90vh] flex items-center"
    >
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: text */}
          <StaggerGroup className="flex flex-col items-start gap-5" stagger={0.1}>
            <FadeUp>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-xs font-mono text-primary/80">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Online · taking new projects
              </span>
            </FadeUp>

            <FadeUp>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.98]">
                <TextReveal text="Full-stack dev," />
                <br />
                <span className="text-gradient-cyan">
                  <TextReveal text="forged for speed." delay={0.3} />
                </span>
              </h1>
            </FadeUp>

            <FadeUp>
              <p className="text-lg text-foreground/80 max-w-xl leading-relaxed">
                We build websites, mobile apps, and SEO systems that help your
                business grow.{" "}
                <span className="text-primary/80 font-medium">
                  Your first demo is free and ready in 48 hours.
                </span>
              </p>
            </FadeUp>

            <FadeUp>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Magnetic strength={0.4}>
                  <Button
                    onClick={() => openBooking({})}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-background font-semibold border-0 group pulse-glow text-base px-6 h-12"
                  >
                    Book a Project
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Magnetic>
                <Magnetic strength={0.4}>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-primary/50 text-primary/80 hover:bg-primary/10 hover:text-primary hover:border-primary bg-primary/5 text-base px-6 h-12"
                  >
                    <a href="#pricing">See pricing</a>
                  </Button>
                </Magnetic>
              </div>
            </FadeUp>

            <FadeUp>
              <div className="mt-4 grid grid-cols-3 gap-x-6 sm:gap-x-10 w-full max-w-md border-t border-primary/15 pt-5">
                <Stat value={2} suffix=" days" label="Demo delivery" />
                <Stat value={6} suffix="+" label="Tech in rotation" />
                <Stat value={24} suffix="h" label="Response time" />
              </div>
            </FadeUp>
          </StaggerGroup>

          {/* Right: Animated code editor mockup */}
          <FadeUp delay={0.4}>
            <HeroCodeEditor />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl sm:text-3xl font-semibold tracking-tight font-mono text-primary">
        <Counter value={value} suffix={suffix} />
      </span>
      <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}
