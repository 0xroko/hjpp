import { readFileSync, writeFileSync } from "fs";
import { writeFile } from "fs/promises";
import { Ollama } from "ollama";
import pLimit from "p-limit";
import { Definicija } from "types";
import { DEFINITIONS_OUTPUT_FILE } from "./const";

const ollama = new Ollama();

const embedDefintion = async (definition: Definicija) => {
  const res = await ollama.embeddings({
    model: "all-minilm",
    prompt: `Riječ: ${definition.rijec}\nDefinicija: ${definition.definicija}`,
  });

  console.log(`Embedded ${definition.rijec}`);

  return {
    ...definition,
    embeddings: res.embedding,
  };
};

type EmbeddedDefintion = Definicija & {
  embeddings: number[];
};

const definitions = JSON.parse(
  readFileSync(DEFINITIONS_OUTPUT_FILE, "utf-8")
) as unknown as Definicija[];
const embeddedDefinitions: EmbeddedDefintion[] = [];

// on ctrl+c save progress
setInterval(async () => {
  await writeFile("emb.json", JSON.stringify(embeddedDefinitions, null, 0));
  console.log("Saved progress...");
}, 1000 * 10);

const p = pLimit(10);

(async () => {
  const pr = definitions.map((definition) =>
    p(async () => {
      const embeddedDefinition = await embedDefintion(definition);
      embeddedDefinitions.push(embeddedDefinition);
    })
  );

  await Promise.all(pr);

  // write to file
  await writeFileSync("emb.json", JSON.stringify(embeddedDefinitions, null, 0));
})();
