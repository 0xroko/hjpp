"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  children?: React.ReactNode | React.ReactNode[];
}

const themeTranslations = {
  light: "svijetlo",
  dark: "tamno",
  system: "sistem",
};

export const ThemeToggle = ({ children }: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={`group invisible border-b border-b-accents-4 text-sm text-accents-4 transition-colors duration-300 hover:border-accents-9 hover:text-accents-9`}
      >
        sistem
      </button>
    );
  }

  return (
    <button
      title="Tema aplikacije"
      onClick={() => {
        switch (theme) {
          case "dark":
            setTheme("light");
            break;
          case "light":
            setTheme("system");
            break;
          case "system":
            setTheme("dark");
            break;
        }
      }}
      className={`group flex border-b border-b-accents-4 text-sm text-accents-4 transition-colors duration-300 hover:border-accents-9 hover:text-accents-9`}
    >
      {themeTranslations[theme as keyof typeof themeTranslations]}
    </button>
  );
};
