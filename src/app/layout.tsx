import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Galaxy from "@/components/Galaxy";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "T-Zero | Space Mission Dashboard",
  description: "Unified, real-time space mission dashboard aggregating data from SpaceX, NASA, and ISRO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className={cn(inter.className, "bg-slate-950 text-white antialiased min-h-screen flex flex-col relative overflow-x-hidden")}>
        <div className="fixed inset-0 z-[-50]">
           <Galaxy mouseInteraction={false} />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-16">
            {children}
          </main>
          <footer className="py-8 text-center text-slate-500 border-t border-white/5 text-sm">
            <p>© {new Date().getFullYear()} T-Zero. Ensuring peace and sustainability in the final frontier.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
