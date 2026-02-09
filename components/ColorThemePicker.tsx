"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { COLOR_THEMES, getColorTheme, setColorTheme, type ColorTheme } from "@/lib/colorTheme";

const THEME_COLORS: Record<ColorTheme, string> = {
  red: "#e5484d",
  blue: "#0091ff",
  green: "#30a46c",
  purple: "#8e4ec6",
  orange: "#f76808",
};

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export default function ColorThemePicker() {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("red");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setColorThemeState(getColorTheme());
  }, []);

  const handleSelect = (theme: ColorTheme) => {
    setColorTheme(theme);
    setColorThemeState(theme);
  };

  return (
    <div className="flex gap-2">
      {COLOR_THEMES.map((theme) => {
        const isActive = colorTheme === theme;
        const color = THEME_COLORS[theme];
        return (
          <motion.button
            key={theme}
            type="button"
            tabIndex={0}
            onClick={() => handleSelect(theme)}
            className="relative w-6 h-6 overflow-visible rounded-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{ backgroundColor: color }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
            transition={spring}
            aria-label={`Switch to ${theme} theme`}
            aria-pressed={isActive}
          >
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: `0 0 0 2px var(--gray-1), 0 0 0 4px ${color}`,
              }}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 0.5,
              }}
              transition={spring}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
