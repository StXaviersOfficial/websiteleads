"use client";

import { SiteNav } from "@/components/site-nav";
import { ScrollVideo } from "@/components/scroll-video";
import { Services } from "@/components/sections/services";
import { Pricing } from "@/components/sections/pricing";
import { Maintenance } from "@/components/sections/maintenance";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { ScrollProgress, CustomCursor } from "@/components/motion-primitives";
import { NoiseOverlay } from "@/components/noise-overlay";
import { BookingProvider } from "@/hooks/use-booking";
import { BookingModal } from "@/components/booking-modal";
import { DiscordFab } from "@/components/discord-fab";

export default function Home() {
  return (
    <BookingProvider>
      <ScrollProgress />
      <CustomCursor />
      <NoiseOverlay />
      <SiteNav />
      <main className="flex-1 relative">
        {/* Scroll-driven video hero — replaces old static Hero + Team sections.
            Video plays frame-by-frame based on scroll position across ~5 viewport heights.
            Text overlays (hero headline, code editor, tech stack, team, CTA) are
            code-added via framer-motion useTransform — not embedded in video. */}
        <ScrollVideo />
        <Services />
        <Pricing />
        <Maintenance />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <BookingModal />
      <DiscordFab />
    </BookingProvider>
  );
}
