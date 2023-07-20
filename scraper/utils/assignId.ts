import { createHash } from "crypto";
import { DefinicijaNoId } from "types";
import { slugify } from ".";

/**
 * id's are slugify(rijec)
 * to prevent collisions, if there are multiple definitions for a word
 * we append the first 2 characters of the hash of the word to the id
 */
export const assignIds = (defs: DefinicijaNoId[]) => {
  const wordToIdMap = new Map<string, string[]>();

  const defWTempId = defs.map((def) => {
    const tempId = slugify(def.rijec);
    wordToIdMap.set(tempId, [...(wordToIdMap.get(tempId) || []), def.rijec]);
    return {
      id: tempId,
      ...def,
    };
  });

  return defWTempId.map((def) => {
    const { id } = def;
    const wordCount = wordToIdMap.get(id)?.length || 0;
    if (wordCount > 1) {
      const hasedWord = createHash("SHA3-512").update(def.rijec);
      // get first 2 characters of hash
      const suffix = hasedWord.digest("base64url").slice(0, 2);
      const urlEncodedSuffix = encodeURIComponent(suffix);

      const newId = `${id}-${urlEncodedSuffix}`;

      return {
        ...def,
        id: newId,
      };
    }

    return def;
  });
};
