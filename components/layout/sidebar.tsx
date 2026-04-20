"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Activity, Users, Zap, BarChart3, Settings } from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";

type SidebarItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
};

export function Sidebar() {
  const mainItems: SidebarItem[] = [
    { icon: <Command className="size-4" />, label: "Panel", href: "/dashboard" },
    { icon: <Zap className="size-4" />, label: "Recomendaciones", href: "/recomendaciones" },
    { icon: <Activity className="size-4" />, label: "LFG", href: "/lfg" },
    { icon: <Users className="size-4" />, label: "Clanes", href: "/clanes" },
    { icon: <BarChart3 className="size-4" />, label: "Eventos", href: "/eventos" },
  ];

  const bottomItems: SidebarItem[] = [
    { icon: <Settings className="size-4" />, label: "Ajustes", href: "/ajustes" },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-300/20 bg-slate-950/85 backdrop-blur-md lg:flex lg:flex-col">
      {/* Logo */}
      <div className="border-b border-slate-300/20 px-5 py-5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-8 border border-cyan-300/50 bg-cyan-300/15 group-hover:border-cyan-200/80 group-hover:bg-cyan-300/25 transition-all duration-200 flex items-center justify-center rounded-md">
            <span className="text-xs font-semibold text-cyan-100">SL</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-cyan-100 group-hover:text-cyan-50 transition-colors duration-200">SquadLink</p>
            <p className="text-xs text-slate-300/75">Navegación principal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav aria-label="Navegacion lateral" className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {mainItems.map((item) => (
          <SidebarLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-300/20 p-3 space-y-2">
        {bottomItems.map((item) => (
          <SidebarLink key={item.href} item={item} />
        ))}
        <LogoutButton />
      </div>
    </aside>
  );
}

function SidebarLink({ item }: { item: SidebarItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={`nav-item flex items-center gap-2 rounded-md border transition-all duration-200 ${
        isActive
          ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-50"
          : "border-slate-300/20 bg-slate-900/40 text-slate-100 hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-cyan-100"
      }`}
    >
      {item.icon}
      <span className="text-sm font-medium">{item.label}</span>
      {item.badge && (
        <span className="ml-auto rounded bg-cyan-300/20 px-1.5 py-0.5 text-xs text-cyan-100">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
