import chalk from "chalk";
import { ensureDir, writeFile } from "fs-extra";
import { readFile } from "fs/promises";
import { join } from "path";
import { parseStringPromise } from "xml2js";
import { DATA_PATH, SITEMAP_JSON, SITEMAP_PATH, SitemapRecord } from "../const";
import { parseDefinitionUrl, sha256 } from "../utils";

const BASE_URL = (page: number) => `https://hjp.znanje.hr/sm_file_${page}.xml`;
const PAGE_COUNT = 3;

const sitemapXmlFilename = (page: number) => `sitemap-${page}.xml`;

export const fetchSitemaps = async () => {
  ensureDir(SITEMAP_PATH);
  const promises = Array.from({ length: PAGE_COUNT }, (_, i) => i + 1).map(
    async (page) => {
      console.log(chalk.blue(`fetching sitemap ${page}`));
      const req = await fetch(BASE_URL(page));
      const text = await req.text();

      await writeFile(join(SITEMAP_PATH, sitemapXmlFilename(page)), text);
      console.log(chalk.green(`fetched sitemap ${page}`));
    }
  );

  await Promise.allSettled(promises);
};

export const convertToJson = async () => {
  const accumulated: SitemapRecord[][] = [];
  const perFileConvert = Array.from(
    { length: PAGE_COUNT },
    (_, i) => i + 1
  ).map(async (page) => {
    const xml = await readFile(join(SITEMAP_PATH, sitemapXmlFilename(page)));
    const parsed = await parseStringPromise(xml);

    const sitemaps = parsed.urlset.url.map((record: any) => ({
      url: record.loc[0],
      lastmod: record.lastmod[0],
      changefreq: record.changefreq[0],
      hjp: parseDefinitionUrl(record.loc[0]),
      urlHash: sha256(record.loc[0]),
    }));

    accumulated.push(sitemaps);
  });

  await Promise.allSettled(perFileConvert);

  const allSitemaps = accumulated.flat();

  await writeFile(SITEMAP_JSON, JSON.stringify(allSitemaps, null, 2));

  console.log(
    chalk.green`Coverted sitemap records to JSON, found ${allSitemaps.length} records.`
  );
};

export const fetchAndConvert = async () => {
  ensureDir(DATA_PATH);

  await fetchSitemaps();
  await convertToJson();
};
