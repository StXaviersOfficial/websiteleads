"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useBooking } from "@/hooks/use-booking";

// EXACT SAME transition for both buttons — no differences
const sharedTransition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };
const sharedInitial = { opacity: 0, scale: 0.8, y: 20 };
const sharedAnimate = { opacity: 1, scale: 1, y: 0 };
const sharedExit = { opacity: 0, scale: 0.8, y: 20 };

export function DiscordFab() {
  const [showPopup, setShowPopup] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [bookExpanded, setBookExpanded] = React.useState(false);
  const [fabVisible, setFabVisible] = React.useState(true);
  const { openBooking } = useBooking();

  React.useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setShowPopup(true), 3000);
    return () => clearTimeout(t);
  }, [dismissed]);

  // Lock body scroll + hide Book a Project FAB while popup is open
  React.useEffect(() => {
    if (showPopup) {
      // Record current scroll position so we can restore it after unlock
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      // position:fixed on body fully prevents scrolling (overflow:hidden alone
      // doesn't work on all browsers, especially with keyboard / touch)
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = `-${scrollX}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      const preventKeyboardScroll = (e: KeyboardEvent) => {
        const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
        if (scrollKeys.includes(e.key)) e.preventDefault();
      };
      document.addEventListener("keydown", preventKeyboardScroll);

      return () => {
        // Restore
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        window.scrollTo(scrollX, scrollY);
        document.removeEventListener("keydown", preventKeyboardScroll);
      };
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [showPopup]);

  // Scroll hide/show — disabled entirely while popup is open (popup locks scroll anyway)
  React.useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;
    let isScrolling = false;

    const onScroll = () => {
      if (showPopup) return; // popup is open — don't touch FAB visibility
      if (!isScrolling) {
        setFabVisible(false);
        isScrolling = true;
      }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setFabVisible(true);
        isScrolling = false;
      }, 500);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimer);
    };
  }, [showPopup]);

  // Force FAB visible whenever popup is showing (overrides any prior hide state)
  React.useEffect(() => {
    if (showPopup) setFabVisible(true);
  }, [showPopup]);

  // Book a Project cycling
  React.useEffect(() => {
    let expandTimer: ReturnType<typeof setTimeout>;
    let collapseTimer: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setBookExpanded(true);
      collapseTimer = setTimeout(() => {
        setBookExpanded(false);
        expandTimer = setTimeout(cycle, 25000);
      }, 4000);
    };
    expandTimer = setTimeout(cycle, 5000);
    return () => { clearTimeout(expandTimer); clearTimeout(collapseTimer); };
  }, []);

  const dismissPopup = () => {
    setShowPopup(false);
    setDismissed(true);
  };

  return (
    <>
      {/* Popup overlay — heavy glass blur, locks page until dismissed */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="discord-fab-popup backdrop-blur-2xl backdrop-saturate-150 backdrop-brightness-110"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={sharedTransition}
            onClick={dismissPopup}
          >
            <motion.div
              className="discord-fab-popup-text backdrop-blur-2xl backdrop-saturate-200"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={sharedTransition}
            >
              <button
                onClick={(e) => { e.stopPropagation(); dismissPopup(); }}
                aria-label="Dismiss popup"
                className="discord-fab-popup-x"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="text-sm text-foreground leading-relaxed">
                Want more info or want to book demos or book projects?{" "}
                <a
                  href="https://discord.gg/VhKgEetwr8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-semibold underline-offset-2 underline"
                  onClick={dismissPopup}
                >
                  Join our Discord server
                </a>{" "}
                for the fastest response.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book a Project — hidden while popup is open (z-index 50, below overlay z-60) */}
      <AnimatePresence>
        {fabVisible && !showPopup && (
          <motion.div
            style={{ position: "fixed", bottom: "100px", right: "24px", zIndex: 50, width: "64px", height: "64px" }}
            initial={sharedInitial}
            animate={sharedAnimate}
            exit={sharedExit}
            transition={sharedTransition}
            title="Book a Project"
          >
            <div style={{ position: "relative", width: "64px", height: "64px" }}>
              <AnimatePresence mode="wait">
                {bookExpanded ? (
                  <motion.button
                    key="expanded"
                    onClick={() => openBooking({})}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={sharedTransition}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Book a Project"
                    title="Book a Project — opens the booking form"
                    className="flex items-center justify-center px-5 h-16 rounded-full whitespace-nowrap"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "linear-gradient(135deg, var(--primary), var(--accent))",
                      color: "var(--background)",
                      fontWeight: 700,
                      fontSize: "14px",
                      boxShadow: "0 8px 24px -4px rgba(34, 211, 238, 0.6), 0 0 0 1px rgba(34, 211, 238, 0.3)",
                    }}
                  >
                    Book a Project
                  </motion.button>
                ) : (
                  <motion.button
                    key="compact"
                    onClick={() => openBooking({})}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={sharedTransition}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Book a Project"
                    title="Book a Project — opens the booking form"
                    className="flex items-center justify-center rounded-full overflow-hidden"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "64px",
                      height: "64px",
                      background: "linear-gradient(135deg, var(--primary), var(--accent))",
                      boxShadow: "0 8px 24px -4px rgba(34, 211, 238, 0.5), 0 0 0 1px rgba(34, 211, 238, 0.3)",
                    }}
                  >
                    <img
                      src="/quackforge-logo.png"
                      alt="Book a Project"
                      className="h-12 w-12 rounded-full object-cover"
                      draggable={false}
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discord — z-index 61 (above popup → stays visible), EXACT SAME animation as Book a Project */}
      <AnimatePresence>
        {fabVisible && (
          <motion.div
            style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 61 }}
            initial={sharedInitial}
            animate={sharedAnimate}
            exit={sharedExit}
            transition={sharedTransition}
          >
            <motion.a
              href="https://discord.gg/VhKgEetwr8"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join our Discord server"
              title="Join our Discord server — fastest way to reach us"
              className="discord-fab-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <DiscordLogo className="h-8 w-8 text-white" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Official Discord logo (SVG) */
export function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.317 4.369C18.777 3.699 17.135 3.213 15.429 2.948C15.213 3.341 14.961 3.87 14.789 4.285C12.988 4.04 11.211 4.04 9.443 4.285C9.271 3.87 9.013 3.341 8.797 2.948C7.09 3.213 5.447 3.7 3.908 4.371C0.926 8.812 0.139 13.139 0.532 17.41C2.584 18.918 4.572 19.831 6.525 20.428C7.022 19.752 7.464 19.034 7.843 18.276C7.117 18.006 6.423 17.675 5.771 17.291C5.941 17.166 6.108 17.036 6.271 16.902C9.954 18.608 13.952 18.608 17.591 16.902C17.755 17.036 17.923 17.166 18.092 17.291C17.439 17.676 16.744 18.007 16.018 18.277C16.397 19.034 16.839 19.753 17.336 20.429C19.29 19.832 21.279 18.919 23.331 17.41C23.797 12.492 22.532 8.205 20.317 4.369ZM8.318 14.731C7.213 14.731 6.305 13.715 6.305 12.462C6.305 11.209 7.194 10.192 8.318 10.192C9.442 10.192 10.35 11.209 10.331 12.462C10.331 13.715 9.442 14.731 8.318 14.731ZM15.914 14.731C14.809 14.731 13.901 13.715 13.901 12.462C13.901 11.209 14.79 10.192 15.914 10.192C17.038 10.192 17.946 11.209 17.927 12.462C17.927 13.715 17.038 14.731 15.914 14.731Z" />
    </svg>
  );
}
