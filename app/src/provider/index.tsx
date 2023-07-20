"use client";
import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children?: React.ReactNode | React.ReactNode[];
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      disableTransitionOnChange
      defaultTheme="light"
      attribute="class"
    >
      {children}
    </ThemeProvider>
  );
}
