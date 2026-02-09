export const COLOR_THEMES = ["red", "blue", "green", "purple", "orange"] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

const STORAGE_KEY = "bookmarks-color-theme";

export function setColorTheme(theme: ColorTheme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  if (theme === "red") {
    document.documentElement.removeAttribute("data-color-theme");
  } else {
    document.documentElement.setAttribute("data-color-theme", theme);
  }
}

export function getColorTheme(): ColorTheme {
  const attr = document.documentElement.getAttribute("data-color-theme");
  if (attr && COLOR_THEMES.includes(attr as ColorTheme)) return attr as ColorTheme;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && COLOR_THEMES.includes(stored as ColorTheme)) return stored as ColorTheme;
  return "red";
}
