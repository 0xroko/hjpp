require("dotenv").config();

import { Presets, SingleBar } from "cli-progress";
import { MEILISEARCH_INDEX } from "config";
import { readFile } from "fs/promises";
import { MeiliSearch } from "meilisearch";
import { Definicija } from "types";
import { DEFINITIONS_OUTPUT_FILE } from "./const";
import { splitIntoEqualArrays } from "./utils";

const bar = new SingleBar({}, Presets.shades_classic);

if (!process.env.MEILI_URL || !process.env.MEILI_MASTER) {
  console.log("Missing env variables");
  process.exit(1);
}

const client = new MeiliSearch({
  host: process.env.MEILI_URL!,
  apiKey: process.env.MEILI_MASTER!,
});

const main = async () => {
  const definitions = readFile(DEFINITIONS_OUTPUT_FILE, {
    encoding: "utf-8",
  });
  const parsedDefinitions = JSON.parse(await definitions) as Definicija[];
  const splitDefinitions = splitIntoEqualArrays(parsedDefinitions, 1000);

  await client.deleteIndex(MEILISEARCH_INDEX);
  await client.createIndex(MEILISEARCH_INDEX);

  await client
    .index(MEILISEARCH_INDEX)
    .updateSearchableAttributes([
      "rijec",
      "detalji",
      "definicija",
      "etimologija",
      "onomastika",
      "frazeologija",
    ]);

  await client
    .index(MEILISEARCH_INDEX)
    .updateFilterableAttributes(["vrsta", "id"]);

  bar.start(splitDefinitions.length, 0);

  for (let i = 0; i < splitDefinitions.length; i++) {
    const splitDefinition = splitDefinitions[i];
    await client.index(MEILISEARCH_INDEX).addDocuments(splitDefinition, {
      primaryKey: "id",
    });

    bar.increment();
  }

  bar.stop();

  console.log("Done");
};

main();
