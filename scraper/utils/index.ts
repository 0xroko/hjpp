import { createHash } from "crypto";

export const splitIntoEqualArrays = <T>(arr: T[], parts: number) => {
  const result: T[][] = [];
  for (let i = parts; i > 0; i--) {
    result.push(arr.splice(0, Math.ceil(arr.length / i)));
  }
  return result;
};

export const slugify = (text: string) => {
  return (
    text
      .toString() // Cast to string (optional)
      .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
      // .toLowerCase() // Convert the string to lowercase letters
      .trim() // Remove whitespace from both sides of a string (optional)
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\_/g, "-") // Replace _ with -
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/\-$/g, "")
  ); // Remove trailing -
};

export const definitionId = (word: string) => {
  const encoded = slugify(word);
  const hash = createHash("SHA3-512");
  const data = hash.update(word).digest("base64url").slice(0, 2);
  return `${encoded}-${encodeURIComponent(data)}`;
};

export const sha256 = (data: string) => {
  const hash = createHash("SHA3-512");
  return hash.update(data).digest("hex");
};

/**
 * extracts id and keyword from url
 */
export const parseDefinitionUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    return {
      id: url.searchParams.get("id"),
      keyWord: url.searchParams.get("keyword"),
    };
  } catch (error) {
    return {
      id: null,
      keyWord: null,
    };
  }
};
