"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type GetRandomDefinition = {
  results: { id: string }[];
  offset: number;
  limit: number;
  total: number;
};

const getRandomDefinition = async () => {
  const req = await fetch(
    `${process.env.NEXT_PUBLIC_MEILISEARCH_URL}/indexes/definitions/documents/fetch`,
    {
      method: "POST",
      body: JSON.stringify({
        // Todo: fetch real number of documents
        offset: Math.floor(Math.random() * 116395),
        limit: 1,
        fields: ["id"],
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MEILISEARCH_DOCUMENT_BY_ID_API_KEY}`,
      },
      cache: "no-cache",
    }
  );

  const data = (await req.json()) as GetRandomDefinition;

  return data;
};

export const SurpriseMeButton = () => {
  const pathName = usePathname();

  const lastPathNameRef = useRef("");

  const [randomDefinition, setRandomDefinition] =
    useState<GetRandomDefinition | null>();

  useEffect(() => {
    const fetch = async () => {
      if (lastPathNameRef.current !== pathName) {
        setRandomDefinition(await getRandomDefinition());
        lastPathNameRef.current = pathName;
      }
    };

    fetch();
  }, [pathName]);

  if (!randomDefinition) return null;

  return (
    <Link
      href={"/r/" + randomDefinition?.results[0]?.id}
      className={`border-b border-b-accents-4 text-sm text-accents-4 transition-colors duration-300 hover:border-accents-9 hover:text-accents-9`}
    >
      iznenadi me
    </Link>
  );
};
