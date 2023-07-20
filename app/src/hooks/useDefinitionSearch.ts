import { useDebounce } from "@/hooks/useDebounce";
import { SearchParams, SearchResponse } from "meilisearch";
import { useEffect, useState } from "react";
import { Definicija } from "types";

/**
 * TODO: remove this once Meilisearch supports ignoring html tags
 */
const cleanSearchQuery = (query: string) => {
  const remove = ["<", ">", "href"];
  let res = query;
  for (const r of remove) {
    res = res.replaceAll(r, "");
  }
  return res;
};

export const useDefinitionSearch = (query: string) => {
  const [result, setResult] = useState<SearchResponse<Definicija>>();

  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    const searchE = async () => {
      const opts = {
        q: cleanSearchQuery(debouncedQuery),
        attributesToHighlight: ["rijec", "definicija"],
      } as SearchParams;
      const t = await fetch(
        `${process.env.NEXT_PUBLIC_MEILISEARCH_URL}/indexes/definitions/search`,
        {
          method: "POST",
          body: JSON.stringify(opts),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY}`,
          },
        }
      );
      const res = (await t.json()) as SearchResponse<Definicija>;

      setResult(res);
    };

    searchE();
  }, [debouncedQuery]);

  return result;
};
