import path from "path";

export const DATA_DIR = ".data";

// one level up from scripts
export const DATA_PATH = path.join(__dirname, "..", DATA_DIR);

export const SITEMAP_PATH = path.join(DATA_PATH, "sitemaps");
export const DEFINITION_PAGES_PATH = path.join(DATA_PATH, "definition-pages");

export const SITEMAP_JSON = path.join(DATA_PATH, "sitemap.json");
export const STATUS_JSON = path.join(DATA_PATH, "status.json");

export const DEFINITIONS_OUTPUT_FILE = path.join(DATA_PATH, "definitions.json");

// temporary attribute since hrefs will be generated at the end of the parsing
export const HJP_HREF_ATTR = "word-id";

// this will be used to generate the href for the word
// /d/ + word-id
export const HREF_PATH = "/r/";

// increase this if you have more cores, although we are still IO bound
export const PARSE_TASK_COUNT = 6;

export interface SitemapRecordBase {
  url: string;
  lastmod: string;
  changefreq: string;
}

export interface SitemapRecord extends SitemapRecordBase {
  urlHash: string;
  hjp: {
    id: string;
    keyWord: string;
  };
}

export type SitemapRecordWStatus = {
  status: "fetched" | "unfetched" | "parsed" | "error";
} & SitemapRecord;
