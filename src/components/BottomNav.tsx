"use client";

import { BarChart3, BookOpen, Home, Target, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/today", icon: Home, label: "Hoy" },
    { href: "/objectives", icon: Target, label: "Objetivos" },
    { href: "/timeline", icon: BookOpen, label: "Timeline" },
    { href: "/stats", icon: BarChart3, label: "Stats" },
    { href: "/profile", icon: User, label: "Yo" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="glass-card rounded-t-3xl border-t border-border/50 shadow-2xl">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                  transition-all duration-200 touch-target
                  ${
                    isActive
                      ? "text-primary scale-110"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                <Icon
                  size={24}
                  className={isActive ? "animate-scale-in" : ""}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? "font-semibold" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
