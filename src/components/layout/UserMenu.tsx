"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Props = {
  userName: string;
  userImage?: string | null;
};

export function UserMenu({ userName, userImage }: Props) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="site-user-trigger gap-2 px-2">
          <span className="site-user-avatar">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <span className="site-user-name hidden sm:inline">{userName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/api/auth/signout?callbackUrl=/" prefetch={false}>
            Выйти
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
