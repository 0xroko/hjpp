import { SurpriseMeButton } from "@/components/SurpriseMeButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { appName } from "@/const";
import Link from "next/link";

interface HeaderProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const Header = ({ children }: HeaderProps) => {
  return (
    <header
      className={`bg-accents-12 sticky top-0 z-[999] w-full bg-opacity-75 text-accents-0 backdrop-blur-[10px]`}
    >
      <div
        className={`mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-6`}
      >
        <Link href="/" className={`text-base font-semibold text-accents-9`}>
          {appName}
        </Link>

        <div className={`flex items-center justify-center gap-5 md:gap-8`}>
          <SurpriseMeButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
