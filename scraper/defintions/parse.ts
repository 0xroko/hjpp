import { load } from "cheerio";
import createDomPurify from "dompurify";
import { readFile } from "fs/promises";
import { JSDOM } from "jsdom";
import set from "lodash.set";
import { join } from "path";
import {
  DefinicijaNoId,
  DefinitionMetadata,
  GlagolskiVid,
  VrstaRijeci,
} from "types";
import { HJP_HREF_ATTR, SitemapRecord } from "../const";
import { parseDefinitionUrl } from "../utils";

const purify = createDomPurify(new JSDOM().window);

purify.addHook("uponSanitizeElement", (node) => {
  if (node.nodeName === "A") {
    const href = node.attributes.getNamedItem("href")?.value;
    const parsedUrl = parseDefinitionUrl("https://example.com/" + href);
    if (parsedUrl?.id) {
      node.setAttribute(HJP_HREF_ATTR, parsedUrl.id);
    }
  }

  return node;
});

const purifyOptions = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "sup", "sub"],
  ALLOWED_ATTR: [],
  ADD_ATTR: [HJP_HREF_ATTR],
};

const remapKeys: any = (
  val: string | any[] | null,
  keysMap: { [x: string]: any }
) => {
  if (val == null) return null;
  if (Array.isArray(val)) {
    return val.map((item) => remapKeys(item, keysMap));
  } else if (typeof val == "object") {
    return Object.keys(val).reduce((obj, key) => {
      const propKey = remapKeys(key, keysMap);
      const propVal = remapKeys(val[key], keysMap);
      // @ts-ignore
      obj[propKey] = propVal;
      return obj;
    }, {});
  } else if (typeof val === "string") {
    return keysMap[val] || val;
  }
  return val;
};

/**
 * these symbols are different in HJP font (I like symbol is W symbol in unicode)
 * they should be replaced with the correct ones (if they even exist)
 */
const wrongSymbols = {
  ẚ: "Z",
  ẛ: "z",
  ẉ: "u",
  Ẉ: "U",
  Ẋ: "I",
  ẋ: "i",
  ẘ: "'",
  Ẍ: "O",
  ẍ: "o",
  ẕ: "r",
  Ẕ: "R",
};

const fixSymbols = (text?: string) => {
  return Object.entries(wrongSymbols).reduce((acc, [glyph, replacement]) => {
    return acc.replace(glyph, replacement);
  }, text ?? "");
};

const removeWhitespaceAndFixsymbols = (text?: string) => {
  const charsToRemove = ["∆", "⃟", "Δ", " ⃟", "✧", "♦", "", "()"];
  const removed = charsToRemove.reduce((acc, char) => {
    return acc.replace(char, "");
  }, text ?? "");

  const fixedSymbols = fixSymbols(removed);

  return fixedSymbols?.replace(/\s+/g, " ").trim();
};

const sanitizeAndRemoveWhitespace = (text?: string) => {
  const sanitized = purify.sanitize(text ?? "", purifyOptions);
  const removed = removeWhitespaceAndFixsymbols(sanitized);
  if (!removed || removed?.length === 0) return null;

  return removed;
};

// there can be multiple bracket pairs in text
const removeTextBetweenBrackets = (
  text?: string,
  startBracket = "〈",
  endBracket = "〉"
) => {
  if (!text) return null;
  const regex = new RegExp(`\\${startBracket}.*?\\${endBracket}`, "g");
  return text.replace(regex, "");
};

const includesAny = (text: string | null, values?: string[]) => {
  return values?.some((value) => text?.includes(value)) ?? false;
};

/**
 * This is THE function for parsing definition
 * NOTE: not moving some obvious things into separate functions was intentional
 * @param record
 */

export const parseDefinitionPage = async (
  record: SitemapRecord,
  pathToDefinitionDir: string
) => {
  let html: string;
  try {
    html = await readFile(join(pathToDefinitionDir, record.urlHash), "utf-8");
  } catch (error: any) {
    // logger.error(error, "error parsing definition %s", record.url);
    return null;
  }

  const { id, keyWord } = parseDefinitionUrl(record.url);
  const definicijaMetadata = {
    hjp: {
      keyWord,
      url: record.url,
      id,
    },
  } as DefinitionMetadata;

  const $ = load(html);

  const rijec = $(".libersina.xl b").text().trim();

  // few pages have empty rijec
  if (!rijec || rijec.length === 0) {
    return null;
  }

  /**
   * podnaslov
   * <b>šàren</b> <i>prid.</i> 〈<i>odr.</i> -ī〉
   *
   * from podnaslov we can infer word type, since podnaslov can contain lots of info (see example below)
   * we infer from html not from text
   * <b>jȃ</b> <i>zam.</i> 〈G A mȅne, <i>enkl.</i> me, D L mȅni, <i>enkl.</i> mi, N <i>mn</i> mȋ, G nȃs, D L nȁma〉 (lična za <i>1. l. jd</i>),
   *
   * IMPORTANT
   * ignore elements inside brackets 〈 〉 -> they dictate derived words types
   */
  const rijecDetalji = $(".libersina.md ");
  const rijecDetaljiWithoutBrackets = removeTextBetweenBrackets(
    rijecDetalji.html() ?? ""
  );

  const imenicaWordDetails = [
    "<i>ž</i>",
    "<i>m</i>",
    "<i>sr</i>",
    "<i>m mn</i>",
    "<i>sr mn</i>",
    "<i>ž mn</i>",
    "<i>sr zb.</i>",
    "<i>ž zb.</i>",
    "<i>m zb.</i>",
  ];
  const IS_IMENICA_WORD_DEALJI = includesAny(
    rijecDetaljiWithoutBrackets,
    imenicaWordDetails
  );

  const prilogWordDetails = ["<i>pril.</i>"];

  const IS_PRILOG_DETALJI_RIJECI = includesAny(
    rijecDetaljiWithoutBrackets,
    prilogWordDetails
  );

  const pridjevWordDetails = ["<i>prid.</i>"];

  const IS_PRIDJEV_DETALJI_RIJECI = includesAny(
    rijecDetaljiWithoutBrackets,
    pridjevWordDetails
  );

  const zamjenicaWordDetails = ["<i>zam.</i>"];

  const IS_ZAMJENICA_DETALJI_RIJECI = includesAny(
    rijecDetaljiWithoutBrackets,
    zamjenicaWordDetails
  );

  const glagolWordDetails = ["<i>nesvrš.</i>", "<i>svrš.</i>", "<i>dv.</i>"];

  const IS_GLAGOL_DETALJI_RIJECI = includesAny(
    rijecDetaljiWithoutBrackets,
    glagolWordDetails
  );

  const prijedlogWordDetails = ["<i>prij.</i>"];

  const IS_PRIJEDLOG_DETALJI_RIJECI = includesAny(
    rijecDetaljiWithoutBrackets,
    prijedlogWordDetails
  );

  const brojWordDetails = ["<i>br.</i>"];

  const IS_BROJ_DETALJI_RIJECI = includesAny(
    rijecDetaljiWithoutBrackets,
    brojWordDetails
  );

  const uskliciWordDetails = ["<i>uzv.</i>"];

  const IS_USKLICI_DETALJI_RIJECI = includesAny(
    rijecDetaljiWithoutBrackets,
    uskliciWordDetails
  );

  const veznik = ["<i>vezn.</i>"];

  const IS_VEZNIK_DETALJI_RIJECI = includesAny(
    rijecDetaljiWithoutBrackets,
    veznik
  );

  const rijecDetaljiSanitized = sanitizeAndRemoveWhitespace(
    rijecDetalji.html() ?? undefined
  );

  /**
   * BETA!!!!
   * Extract izvedeni oblici from the table
   * since the table's structure is not consistent, we iterate over rows and extract data
   * where th elements dictate the indentation level of the data
   * -------------------------------------------------------
   * 											{
   * Nesvršeni   					 "infinitiv": "štedjeti"
   *  infinitiv						  "prezent": {
   *   štedjeti							 "jednina": {
   *													 "1": "štedim",
   * prezent									 "2": "štediš"
   *  jednina								  },
   *   1.	štedim							"množina": {
   *   2.	štediš							 "1": "štedimo",
   *  množina									 "2": "štedite"
   *   1.	štedimo						},
   *   2.	štedite					 }
   * -------------------------------------------------------
   */
  const izvedeniOblici = $("#izvedeni-oblici");
  const izvedeniObliciTable = izvedeniOblici.find("tbody").first();
  let izvedeniObliciRows = izvedeniObliciTable.find("tr").filter((i, el) => {
    const row = $(el);
    const isTh = row.find("th").length > 0;
    // remove empty th
    if (isTh) {
      const text = row.find("th").first().text().trim();
      return text.length > 0;
    }
    return true;
  });

  /**
   * Fix the case when Pozitiv - neodr. (!!EMPTY ONE!!!) is followed by Pozitiv - odr.
   *	Pozitiv - neodr.
   *
   *	Pozitiv - odr.
   */
  izvedeniObliciRows = izvedeniObliciRows.filter((i, el) => {
    const row = $(el);
    const text = row.find("th").first().text().trim();
    if (
      text.includes("Pozitiv - neodr.") &&
      i + 1 < izvedeniObliciRows.length
    ) {
      const nextRow = $(izvedeniObliciRows[i + 1]);
      const nextRowText = nextRow.find("th").first().text().trim();
      return !nextRowText.includes("Pozitiv - odr.");
    }
    return true;
  });

  const numberOfThConsecutiveAhead = (i: number) => {
    let count = 0;
    for (let j = i; j < izvedeniObliciRows.length; j++) {
      const row = $(izvedeniObliciRows[j]);
      const isTh = row.find("th").length > 0;
      if (isTh) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  let maxThDepth = 0;
  // find max th depth
  izvedeniObliciRows.each((i, el) => {
    const row = $(el);
    const isTh = row.find("th").length > 0;
    if (isTh) {
      const thDepth = numberOfThConsecutiveAhead(i);
      if (thDepth > maxThDepth) {
        maxThDepth = thDepth;
      }
    }
  });

  let izvedeniObliciData =
    izvedeniObliciRows.length > 0 ? ({} as Record<string, any>) : null;

  /**
   * keyStack is used to keep track of where to put data
   * ["komparativ", "muski rod", "jednina", "N"]
   */
  let keyStack: string[] = [];

  /**
   * for some reason 'glagolski pridjevi/imenice' are not at the same indent level as other izvedeni oblici
   */
  let GLAGOLSKI_EDGE_CASE_FOUND = false;
  /**
   * if th includes 'svršeni' -> glagol
   * this is needed because glagol "type" isn't part of izvedeni oblici
   */
  let IS_GLAGOL_IZVEDENI_OBLIK = false;
  let IS_PRIDJEV_IZVEDENI_OBLIK = false;

  const izvedeniObliciForPridjev = [
    "Pozitiv",
    "Komparativ",
    "Superlativ",
    "Pozitiv - odr.",
    "Pozitiv - neodr.",
  ];

  let tipGlagola: GlagolskiVid | null = null;
  let tipGlagolaRaw: string | null = null;

  for (let i = 0; i < izvedeniObliciRows.length; i++) {
    const row = $(izvedeniObliciRows[i]);
    // if th then add new object nested with key same as text
    // if td then add to last object
    const isTh = row.find("th").length > 0;
    const isTd = row.find("td").length > 0;

    if (isTh) {
      if (maxThDepth === keyStack.length) {
        for (let j = 0; j < numberOfThConsecutiveAhead(i); j++) {
          keyStack.pop();
        }
      }

      const thText = row.find("th").first().text().trim();

      if (thText.includes("glagolski") && !GLAGOLSKI_EDGE_CASE_FOUND) {
        maxThDepth = 1;
        GLAGOLSKI_EDGE_CASE_FOUND = true;
        keyStack.pop();
      }

      if (izvedeniObliciForPridjev.some((el) => thText.includes(el))) {
        IS_PRIDJEV_IZVEDENI_OBLIK = true;
      }

      if (thText.includes("Nesvršeni")) {
        IS_GLAGOL_IZVEDENI_OBLIK = true;
        tipGlagola = "nesvršeni";
        tipGlagolaRaw = thText;
      } else if (thText.includes("Dv.")) {
        IS_GLAGOL_IZVEDENI_OBLIK = true;
        tipGlagola = "dvovidni";
        tipGlagolaRaw = thText;
      } else if (thText.includes("Svršeni")) {
        IS_GLAGOL_IZVEDENI_OBLIK = true;
        tipGlagola = "svršeni";
        tipGlagolaRaw = thText;
      }

      const key = row.find("th").first().text().trim();
      keyStack.push(key);
    }

    if (isTd) {
      const key = row.find("td").first().text().trim();
      const value = row.find("td").last().text().trim();
      // if (key !== value) {
      keyStack.push(key);
      // }
      set(izvedeniObliciData!, keyStack, value);
      // if (key !== value) {
      keyStack.pop();
      // }
    }
  }
  /**
   * fix
   *  {"svršeni": {
   * 		"infinitiv": "jesti"
   *  }}
   * to
   *  {"infinitiv": "jesti"}
   * in `izvedeniObliciData`
   */
  if (izvedeniObliciData && IS_GLAGOL_IZVEDENI_OBLIK && tipGlagolaRaw) {
    const infintiv = izvedeniObliciData[tipGlagolaRaw];
    if (infintiv) {
      izvedeniObliciData = Object.assign(
        {
          ...infintiv,
        },
        izvedeniObliciData
      );

      izvedeniObliciData && delete izvedeniObliciData[tipGlagolaRaw];
    }
  }

  /**
   * convert to array if all keys are same as values
   */
  if (izvedeniObliciData) {
    for (const key in izvedeniObliciData) {
      const value = izvedeniObliciData[key];
      if (typeof value === "object") {
        const allKeysSameAsValues = Object.keys(value).every(
          (k) => k === value[k]
        );
        if (allKeysSameAsValues) {
          izvedeniObliciData[key] = Object.values(value);
          // if value is array of length 1, then just use that value
          if (izvedeniObliciData[key].length === 1) {
            izvedeniObliciData[key] = izvedeniObliciData[key][0];
          }
        }
      }
    }
  }

  /**
   * remap izvedeni oblici keys
   */
  const keysRemap = {
    // rodovi
    "ženski rod": "zenskiRod",
    "muški rod": "muskiRod",
    "srednji rod": "srednjiRod",
    // pridjevi
    Pozitiv: "pozitiv",
    Komparativ: "komparativ",
    Superlativ: "superlativ",
    "Pozitiv - odr.": "pozitivOdredeni",
    "Pozitiv - neodr.": "pozitivNeodredeni",
    // jednina/mnozina
    jednina: "jednina",
    množina: "mnozina",
    // lica
    "1.": "prvoLice",
    "2.": "drugoLice",
    "3.": "treceLice",
    // padezi
    N: "nominativ",
    G: "genitiv",
    D: "dativ",
    A: "akuzativ",
    V: "vokativ",
    I: "instrumental",
    L: "lokativ",
    // glagski oblici
    "glagolski pridjev aktivni": "glagolskiPridjevAktivni",
    "glagolski pridjev pasivni": "glagolskiPridjevPasivni",
    "glagolski prilog sadašnji": "glagolskiPrilogSadasnji",
    "glagolski prilog prošli": "glagolskiPrilogProsli",
    infinitiv: "infinitiv",
    imperativ: "imperativ",
    prezent: "prezent",
    perfekt: "perfekt",
    imperfekt: "imperfekt",
    pluskvamperfekt: "pluskvamperfekt",
    futur: "futur",
  };

  if (izvedeniObliciData) {
    izvedeniObliciData = remapKeys(izvedeniObliciData, keysRemap);
  }

  /**
   * -------------------------------------------------------
   * END IZVEDENI OBLICI
   * -------------------------------------------------------
   */

  let definicija: string | { [key: string]: string } = "";
  const definitionContainier = $("#definicija");
  const definitionRows = definitionContainier.find("tr");

  if (definitionRows.length === 0) {
    const singleDefintion = definitionContainier.find("div");

    definicija =
      sanitizeAndRemoveWhitespace(singleDefintion.html() ?? "") ?? "";
  } else {
    definicija = {};
    for (let i = 0; i < definitionRows.length; i++) {
      const row = $(definitionRows[i]);
      const definitionNumber =
        row.find("td").first().text().trim()?.replace(".", "") ?? "";
      const definitionElement = row.find("td").last();
      const definitionText = sanitizeAndRemoveWhitespace(
        definitionElement.html() ?? ""
      );

      definicija[definitionNumber] = definitionText ?? "";
    }
  }

  // -------------------------------------------------------
  const sintagmaElm = $("#sintagma > div");
  const sintagmaHtml = sanitizeAndRemoveWhitespace(
    sintagmaElm.html() ?? undefined
  );

  const sintagme =
    sintagmaHtml
      ?.split("<br>")
      .map((el) => {
        // assume it's always <b><i> sintagma </i></b> znacenje
        const s = el.split("</i></b>");
        if (s.length === 1) return null;
        const sintagma = s[0].replace("<b><i>", "").trim();
        const znacenje = s.splice(1).join("").trim();
        return {
          sintagma,
          znacenje: znacenje ?? null,
        };
      })
      ?.filter((el) => el !== null) ?? null;

  // -------------------------------------------------------
  const frazeologijaElm = $("#frazeologija > div");
  const frazeologijaHtml = sanitizeAndRemoveWhitespace(
    frazeologijaElm.html() ?? undefined
  );

  const frazeologije =
    frazeologijaHtml
      ?.split("<br>")
      .map((el) => {
        // assume it's always <b><i> frazeologija </i></b> znacenje
        const s = el.split("</i></b>");
        if (s.length === 1) return null;
        const fraza = s[0].replace("<b><i>", "").trim();
        const znacenje = s.splice(1).join("").trim();
        return {
          fraza,
          znacenje: znacenje ?? null,
        };
      })
      ?.filter((el) => el !== null) ?? null;

  // -------------------------------------------------------

  const etimologijaElm = $("#etimologija > div");
  const etimologijaHtml = sanitizeAndRemoveWhitespace(
    etimologijaElm.html() ?? undefined
  );

  const etimologija = etimologijaHtml ?? null;

  // -------------------------------------------------------
  const onomastikaElm = $("#onomastika > div");
  const onomastikaHtml = sanitizeAndRemoveWhitespace(
    onomastikaElm.html() ?? undefined
  );

  const onomastika = onomastikaHtml ?? null;

  // -------------------------------------------------------

  /**
   * since nowhere on the page word type is specified
   * we guess it based on hints from the page
   * like `IS_GLAGOL_IZVEDENI_OBLIK`
   */
  let vrstaRijeci: VrstaRijeci = "nepoznato";

  if (IS_GLAGOL_IZVEDENI_OBLIK || IS_GLAGOL_DETALJI_RIJECI) {
    vrstaRijeci = "glagol";
  } else if (IS_BROJ_DETALJI_RIJECI) {
    vrstaRijeci = "broj";
  } else if (IS_PRIDJEV_IZVEDENI_OBLIK || IS_PRIDJEV_DETALJI_RIJECI) {
    vrstaRijeci = "pridjev";
  } else if (IS_IMENICA_WORD_DEALJI) {
    vrstaRijeci = "imenica";
  } else if (IS_PRILOG_DETALJI_RIJECI) {
    vrstaRijeci = "prilog";
  } else if (IS_ZAMJENICA_DETALJI_RIJECI) {
    vrstaRijeci = "zamjenica";
  } else if (IS_USKLICI_DETALJI_RIJECI) {
    vrstaRijeci = "usklik";
  } else if (IS_VEZNIK_DETALJI_RIJECI) {
    vrstaRijeci = "veznik";
  } else if (IS_PRIJEDLOG_DETALJI_RIJECI) {
    vrstaRijeci = "prijedlog";
  }

  const definicijaFull = {
    rijec: fixSymbols(rijec),
    detalji: rijecDetaljiSanitized ?? null,
    vrsta: vrstaRijeci,
    izvedeniOblici: izvedeniObliciData,
    definicija,
    sintagma: sintagme,
    frazeologija: frazeologije,
    etimologija,
    onomastika,
    ...definicijaMetadata,
  } as DefinicijaNoId;

  if (vrstaRijeci === "glagol" && tipGlagola) {
    Object.assign(definicijaFull, {
      glagolskiVid: tipGlagola,
    });
  }

  return definicijaFull;
};
