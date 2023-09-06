"use client";
import { useFocusOnKeypress } from "@/hooks/useFocusOnKeypress";
import { useSearchParamsState } from "@/hooks/useQueryParamsState";
import { useEffect, useRef, useState } from "react";

interface SearchProps {
  children?: React.ReactNode | React.ReactNode[];
  onChange: (query: string) => void;
}

/**
 * Search component that also handles global search state (url query params)
 */
export const Search = ({ children, onChange }: SearchProps) => {
  // this cannot be in page.tsx :( for some reason
  const [search, setSearch] = useSearchParamsState();

  const [isFocused, setIsFocused] = useState(false);

  const searchBarRef = useRef<HTMLInputElement>(null);
  useFocusOnKeypress(searchBarRef, "/", false);

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.onfocus = () => setIsFocused(true);
      searchBarRef.current.onblur = () => setIsFocused(false);
    }
  }, [searchBarRef]);

  // global search value should be inside context
  useEffect(() => {
    onChange(search);
  }, [search, onChange]);

  return (
    <div
      className={`mt-16 flex items-center border-b border-accents-6 px-2 focus-within:border-b-[1.5px] md:mt-32`}
    >
      <svg
        className={`mr-2 flex h-4 w-4 shrink-0 grow-0 text-accents-6`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <input
        ref={searchBarRef}
        value={search}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        name="query"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="upiši pojam"
        className={`hide-clear h-7 w-full bg-transparent font-medium outline-none placeholder:font-normal placeholder:text-accents-6`}
        type="search"
      />
      {!isFocused && (
        <span
          className={`flex items-center justify-center rounded-md border border-accents-2 px-1 font-mono text-sm text-accents-6`}
        >
          /
        </span>
      )}
    </div>
  );
};
