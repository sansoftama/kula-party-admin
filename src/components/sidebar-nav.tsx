"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  enabled: boolean;
  isActive?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Health",
    enabled: true,
    isActive: (pathname) => pathname === "/" || pathname === "/health",
  },
  {
    href: "/users",
    label: "Users",
    enabled: true,
    isActive: (pathname) => pathname === "/users" || pathname.startsWith("/users/"),
  },
  {
    href: "/moderation",
    label: "Moderation",
    enabled: true,
    isActive: (pathname) =>
      pathname === "/moderation" || pathname.startsWith("/moderation/"),
  },
  { href: "/payments", label: "Payments", enabled: false },
  { href: "/leaderboards", label: "Leaderboards", enabled: false },
  { href: "/rooms", label: "Rooms / Flags", enabled: false },
  { href: "/support", label: "Support", enabled: false },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="px-2 py-2 md:py-3">
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {NAV_ITEMS.map((item) => {
          const active = item.enabled && (item.isActive?.(pathname) ?? false);
          if (!item.enabled) {
            return (
              <li key={item.label}>
                <span
                  aria-disabled="true"
                  title="Not available in this version"
                  className="flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm text-zinc-600 md:w-full"
                >
                  {item.label}
                  <span className="text-[10px] font-medium uppercase tracking-wide">
                    Soon
                  </span>
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm md:w-full ${
                  active
                    ? "bg-white/10 font-medium text-white"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
