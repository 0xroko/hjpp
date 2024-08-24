import { useDebounce } from "@/hooks/useDebounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const useSearchParamsState = () => {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathName = usePathname()!;

  const [search, setSearchInternal] = useState<string>(
    searchParams.get("search") || ""
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const searchDebounced = useDebounce(search.trim(), 300);

  useEffect(() => {
    // sync search state with url
    const searchParam = searchParams.get("search") || "";
    if (searchParam === "") return;
    if (searchParam === searchDebounced) return;
    setSearchInternal(searchParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const newString = createQueryString("search", searchDebounced);
    if (newString === searchParams.toString()) return;
    if (searchDebounced === "") {
      router.push(pathName, { scroll: false });
      return;
    }
    router.replace(pathName + "?" + newString, { scroll: false });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounced]);

  return [search, setSearchInternal] as const;
};
