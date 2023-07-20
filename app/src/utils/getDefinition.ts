import { Definicija } from "types";

export const getDefinition = async (id: string) => {
  const t = await fetch(
    `${process.env.NEXT_PUBLIC_MEILISEARCH_URL}/indexes/definitions/documents/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MEILISEARCH_DOCUMENT_BY_ID_API_KEY}`,
      },
    }
  );

  try {
    const res = JSON.parse(await t.text()) as Definicija;
    if (res?.rijec === undefined)
      throw new Error("No definition found for: " + id);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};
