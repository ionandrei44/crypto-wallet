"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ModeToggle } from "./ui/toggle-mode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  signIn,
  signOut,
  useSession,
  getProviders,
  LiteralUnion,
  ClientSafeProvider,
} from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";
import { Button } from "./ui/button";

const Navigation = () => {
  const { data: session } = useSession();
  const [providers, setProviders] = useState<Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null>(null);

  const handleAuthentication = () => {
    session?.user ? signOut() : providers && signIn();
  };

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders();

      setProviders(response);
    };

    setUpProviders();
  }, []);

  return (
    <div className="wrapper flex-container-center justify-between">
      <div className="flex-container-center gap-4">
        <Link
          href="/"
          className="border-b border-transparent hover:border-foreground"
        >
          Home
        </Link>
        <Link
          href="/my-wallet"
          className="border-b border-transparent hover:border-foreground"
        >
          My Wallet
        </Link>
      </div>
      <div className="flex-container-center gap-4">
        <ModeToggle />

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage
                  src={session.user?.image ?? ""}
                  alt={session.user?.name ?? ""}
                />
                <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleAuthentication}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleAuthentication}>Sign In</Button>
        )}
      </div>
    </div>
  );
};

export default Navigation;
