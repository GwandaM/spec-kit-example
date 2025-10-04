"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Wallet,
  ShoppingCart,
  ListChecks,
  MessageSquare,
  Dumbbell,
  StickyNote,
  Settings as SettingsIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/groceries", label: "Groceries", icon: ShoppingCart },
  { href: "/chores", label: "Chores", icon: ListChecks },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const mobileItems = navItems.slice(0, 5);

export function HouseholdNavigation(): JSX.Element {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <>
      <nav className="hidden h-full w-60 flex-col gap-4 border-r bg-background py-6 pl-4 pr-3 lg:flex">
        <div className="flex items-center justify-between pr-1">
          <Link href="/" className="text-xl font-semibold">
            Flatmate Life
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className="justify-start gap-3"
              >
                <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold">
            Flatmate Life
          </Link>
          <Button size="icon" variant="ghost" onClick={toggle} aria-label="Toggle navigation">
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </Button>
        </div>
        {isOpen ? (
          <Card className="mx-4 mb-4 shadow-lg">
            <div className="flex flex-col gap-1 p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    asChild
                    onClick={close}
                    variant={isActive ? "secondary" : "ghost"}
                    className="justify-start gap-3"
                  >
                    <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                      <Icon className="h-4 w-4" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </Card>
        ) : null}
      </div>

      <Card className="fixed inset-x-0 bottom-2 mx-auto flex w-[calc(100%-2rem)] justify-between border shadow-lg lg:hidden">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </Card>
    </>
  );
}
