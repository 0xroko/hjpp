import chalk from "chalk";
import { existsSync } from "fs-extra";
import { readFile, writeFile } from "fs/promises";
import {
  SITEMAP_JSON,
  STATUS_JSON,
  SitemapRecord,
  SitemapRecordWStatus,
} from "../const";

/**
 * contains utility functions for status.json
 * status.json is used to keep track of which sitemap records have been fetched
 */

export const buildStatusFile = async (
  defaultStatus: SitemapRecordWStatus["status"] = "unfetched"
) => {
  const sitemapRecord = JSON.parse(
    await readFile(SITEMAP_JSON, { encoding: "utf-8" })
  ) as SitemapRecord[];

  const status: SitemapRecordWStatus[] = sitemapRecord.map((record) => ({
    ...record,
    status: defaultStatus,
  }));

  console.log(chalk.magenta`Built status file.`);

  await writeFile(STATUS_JSON, JSON.stringify(status, null, 2));
};

export const readStatusFile = async () => {
  const status = await readFile(STATUS_JSON, "utf-8");
  if (!status || status?.length === 0) {
    console.log(chalk.red`Status file is empty/doesn't exist.`);
    console.log(chalk.red`Did you run 'sitemap' command?`);
    console.log(chalk.red`Exiting...`);
    process.exit(1);
  }
  return JSON.parse(status) as SitemapRecordWStatus[];
};

export const writeStatus = async (status: SitemapRecordWStatus[]) => {
  await writeFile(STATUS_JSON, JSON.stringify(status, null, 2));
};

export const statusFileExists = () => {
  return existsSync(STATUS_JSON);
};
