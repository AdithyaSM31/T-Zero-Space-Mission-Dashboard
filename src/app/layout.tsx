import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
export const metadata: Metadata = {
  title: "T-Zero | Orbital Mission Control",
  description: "A bigger perspective on space exploration. Discover upcoming launches, explore rocket fleets, and follow humanity beyond Earth.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body><a className="skip-link" href="#main-content">Skip to content</a><div className="app-shell"><Navbar/><main id="main-content" className="workspace">{children}</main></div></body></html>;
}
