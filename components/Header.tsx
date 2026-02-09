"use client";

import { motion, useReducedMotion } from "motion/react";

interface HeaderProps {
  title?: string;
}

const headerTransition = { type: "spring" as const, bounce: 0.15, duration: 0.5 };

export default function Header({ title = "bookmarks" }: HeaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 bg-card z-40"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
      />
      <motion.header
        initial={prefersReducedMotion ? false : { y: "-100%" }}
        animate={{ y: 0 }}
        transition={headerTransition}
        className="w-full bg-card relative flex flex-col items-center justify-center"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          willChange: prefersReducedMotion ? "auto" : "transform",
        }}
      >
        <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
        </div>
      </motion.header>
    </>
  );
}
