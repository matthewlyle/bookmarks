"use client";

import { motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { Home, Plus, FolderOpen, Settings, LogIn } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearch } from "@/lib/SearchContext";
import { cn } from "@/lib/utils";

interface BottomBarProps {
  onOpenAdd: () => void;
  onOpenCategories: () => void;
}

interface NavButtonProps {
  label: string;
  icon: LucideIcon;
  href: string;
  className?: string;
  onClick?: () => void;
}

function NavButton({ label, icon: Icon, href, className, onClick }: NavButtonProps) {
  return (
    <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} className="inline-flex">
      <Link
        href={href}
        aria-label={label}
        onClick={onClick}
        className={cn(
          "group flex size-16 shrink-0 cursor-pointer items-center justify-center p-5 text-black interactive-transition hover:bg-primary hover:text-primary-foreground",
          className
        )}
      >
        <Icon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:scale-125 group-active:scale-95 motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100" />
      </Link>
    </motion.span>
  );
}

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

function ActionButton({ label, icon: Icon, onClick, className }: ActionButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group flex size-16 shrink-0 cursor-pointer items-center justify-center p-5 text-black interactive-transition hover:bg-primary hover:text-primary-foreground",
        className
      )}
    >
      <Icon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:scale-125 group-active:scale-95 motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100" />
    </motion.button>
  );
}

export default function BottomBar({ onOpenAdd, onOpenCategories }: BottomBarProps) {
  const { status } = useSession();
  const { setSelectedCategoryId } = useSearch();
  const prefersReducedMotion = useReducedMotion();
  const isAuthenticated = status === "authenticated";

  return (
    <>
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50"
        initial={prefersReducedMotion ? false : { y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        style={{ willChange: prefersReducedMotion ? "auto" : "transform" }}
      >
        <div className="flex items-center justify-center border-t border-border bg-card shadow-lg" role="toolbar" aria-label="Main toolbar">
            <NavButton label="Go to home" icon={Home} href="/" onClick={() => {
              setSelectedCategoryId(null);
            }} />
            {isAuthenticated && (
              <ActionButton
                label="Add bookmark"
                icon={Plus}
                onClick={onOpenAdd}
              />
            )}
            <ActionButton
              label="Browse categories"
              icon={FolderOpen}
              onClick={onOpenCategories}
              className="md:hidden"
            />
            {isAuthenticated ? (
              <NavButton label="Settings" icon={Settings} href="/settings" />
            ) : (
              <NavButton label="Sign in" icon={LogIn} href="/auth" />
            )}
        </div>
      </motion.div>
    </>
  );
}
