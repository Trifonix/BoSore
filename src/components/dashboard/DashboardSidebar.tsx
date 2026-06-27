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
    <aside className="dashboard-sidebar">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="dashboard-avatar">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt="" className="h-full w-full object-cover" />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="dashboard-user-label">Личный кабинет</p>
          <p className="dashboard-user-name">{userName}</p>
        </div>
      </div>

      <nav className="dashboard-nav">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "dashboard-nav-link",
                active && "dashboard-nav-link--active",
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

      <Link href="/" className="dashboard-home-link">
        ← На главную
      </Link>
    </aside>
  );
}
