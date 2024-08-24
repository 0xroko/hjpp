"use client";
import { Search } from "@/components/Searchbar";
import { useDefinitionSearch } from "@/hooks/useDefinitionSearch";
import { replaceAWithLink } from "@/utils/replaceLink";
import Link from "next/link";
import { Suspense, useState } from "react";

interface SearchProps {
  children?: React.ReactNode | React.ReactNode[];
}

export default function Home() {
  const [search, setSearch] = useState("");

  const result = useDefinitionSearch(search);

  return (
    <>
      <div className={`pt-12 md:pt-36`}>
        <h1
          className={`text-5xl font-bold leading-normal tracking-tight md:text-[5rem]`}
        >
          prȅtraga
        </h1>
        <p className={`text-[1.1rem] italic text-accents-6 md:text-xl`}>
          prȅtraga ž 〈D L -azi〉
        </p>
      </div>
      <Suspense>
        <Search onChange={setSearch} />
      </Suspense>

      {search?.length > 0 ? (
        <div
          className={`mt-[60px] flex flex-col gap-8 [&_em]:rounded-sm [&_em]:bg-search-highlight [&_em]:not-italic`}
        >
          {result?.hits?.map((hit) => {
            return (
              <div key={hit?.id} className={`relative text-accents-9`}>
                <Link className={`absolute inset-0`} href={`/r/${hit?.id}`} />
                <div
                  className={`mb-2 text-xl font-semibold !text-accents-9`}
                  dangerouslySetInnerHTML={{
                    __html: hit?._formatted?.rijec!,
                  }}
                />

                {typeof hit?.definicija === "string" ? (
                  <div className={`text-accents-9`}>
                    {replaceAWithLink(hit?._formatted?.definicija as string)}
                  </div>
                ) : (
                  <ol className={`list-inside list-decimal`}>
                    {Object.values(hit?._formatted?.definicija ?? {}).map(
                      (def: any) => (
                        <li className={`[&>em]:bg-search-highlight`} key={def}>
                          {replaceAWithLink(def)}
                        </li>
                      )
                    )}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`my-60 flex items-center justify-center`}></div>
      )}
    </>
  );
}
