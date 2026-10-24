"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BarChart3, Clock3, Globe2, LayoutDashboard, Rocket } from "lucide-react";
const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Launch Center", href: "/launch-center", icon: Rocket },
  { label: "Fleet Explorer", href: "/fleet-explorer", icon: Globe2 },
  { label: "Mission History", href: "/mission-timeline", icon: Clock3 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];
export function Navbar() {
  const pathname = usePathname();
  return <aside className="mission-sidebar">
    <Link href="/" className="wordmark" aria-label="T-Zero home"><span className="brand-orbit"><Rocket size={21}/></span>T–ZERO<span className="brand-dot">®</span></Link>
    <div className="sidebar-caption">SPACE EXPLORATION, CONNECTED.</div>
    <div className="nav-caption">WORKSPACE</div>
    <nav aria-label="Main navigation">{navigation.map(({ label, href, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`nav-item ${pathname === href ? "selected" : ""}`}><Icon size={18}/><span>{label}</span>{pathname === href && <span className="nav-active-dot"/>}</Link>)}</nav>
    <div className="sidebar-bottom"><div className="orbital-note"><span className="eyebrow">A BIGGER PERSPECTIVE</span><p>One planet.<br/>Infinite possibilities.</p><span className="tiny-orbit"/></div><a className="source-link" href="https://github.com/AdithyaSM31/T-Zero-Space-Mission-Dashboard" target="_blank" rel="noreferrer">Explore the project <ArrowUpRight size={15}/></a><div className="sidebar-version"><span className="status-dot"/> T-ZERO / MISSION CONTROL</div></div>
  </aside>;
}
