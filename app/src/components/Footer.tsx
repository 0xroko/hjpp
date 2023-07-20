import { appName, githubRepoLink } from "@/const";
import Link from "next/link";

interface FooterProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const Footer = ({ children }: FooterProps) => {
  return (
    <footer className="mt-6 w-full border-t border-accents-2 border-opacity-50 text-accents-1">
      <div
        className={`mx-auto max-w-5xl flex-col justify-between gap-[2px] px-6 pb-12 pt-20`}
      >
        <p className={`text-accents-6`}>{appName}</p>

        <Link
          href={githubRepoLink}
          className={`whitespace-nowrap text-accents-6`}
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          target="_blank"
        >
          Github Repo
        </Link>
      </div>
    </footer>
  );
};
