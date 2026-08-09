import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "QuackForge Business Leads — 1,078 Real Verified Businesses",
  description: "Real businesses with real phone numbers. Accept, reject, or mark as maybe. Call or WhatsApp directly.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", background: "#0A0F1C", color: "#E6FBFF" }}>
        {children}
      </body>
    </html>
  );
}
