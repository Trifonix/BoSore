"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Globe,
  History,
  MessageSquare,
  Settings,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  userName: string;
  userImage?: string | null;
};

const NAV = [
  { href: "/dashboard", label: "Источники", icon: MessageSquare, exact: true },
  { href: "/dashboard/favorites", label: "Избранное", icon: Star },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/public", label: "Публичные", icon: Globe },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

export function DashboardSidebar({ userName, userImage }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col bg-gradient-to-b from-sky-100 via-sky-50 to-blue-50 px-4 py-6 shadow-sm">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-sky-200 text-sm font-semibold text-sky-800 ring-2 ring-white">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt="" className="h-full w-full object-cover" />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm text-sky-700/70">Личный кабинет</p>
          <p className="font-semibold text-slate-800">{userName}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/80 text-sky-800 shadow-sm ring-1 ring-sky-100"
                  : "text-slate-600 hover:bg-white/50 hover:text-slate-800",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {href === "/dashboard/favorites" && (
                <Bookmark className="ml-auto h-3.5 w-3.5 opacity-40" />
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="mt-4 rounded-xl px-3 py-2 text-center text-sm text-slate-500 hover:bg-white/50 hover:text-slate-700"
      >
        ← На главную
      </Link>
    </aside>
  );
}
