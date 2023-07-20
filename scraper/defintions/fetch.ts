import axios from "axios";
import chalk from "chalk";
import { MultiBar, Presets } from "cli-progress";
import { ensureDir, writeFile } from "fs-extra";
import pLimit from "p-limit";
import { join } from "path";
import { DEFINITION_PAGES_PATH, SitemapRecord } from "../const";
import { readStatusFile, writeStatus } from "../utils/statusFile";

const multiBar = new MultiBar(
  {
    format: "[{bar}] {percentage}% | {value}/{total} | ETA: {eta}s",
  },
  Presets.shades_classic
);

const fetchDefinitionPage = async (sitemapRecord: SitemapRecord) => {
  const req = await axios.get(sitemapRecord.url, {
    headers: {
      "User-Agent": "For-Personal-Project",
    },
    timeout: 1000 * 5,
  });
  const text = req.data;
  await writeFile(join(DEFINITION_PAGES_PATH, sitemapRecord.urlHash), text);
};

const ERROR_THRESHOLD = 15;

let errorPageCount = 0;

export const fetchDefinitionPages = async () => {
  ensureDir(DEFINITION_PAGES_PATH);

  const sitemapRecords = await readStatusFile();
  const recordsToFetch = sitemapRecords.filter(
    (r) => r.status === "unfetched" || r.status === "error"
  );

  console.log(chalk.blue`Found ${recordsToFetch.length} records to fetch.`);

  if (recordsToFetch.length === 0) {
    console.log(
      "No records to fetch, if you want to refetch, run with --force flag."
    );
    return;
  }

  const bar1 = multiBar.create(0, 0);
  bar1.start(recordsToFetch.length, 0);

  const promiseLimiter = pLimit(30);

  const fetchPromises = recordsToFetch.map((record) =>
    promiseLimiter(async () => {
      const currentRecord = sitemapRecords.find((r) => r.url === record.url)!;
      try {
        await fetchDefinitionPage(record);
        currentRecord.status = "fetched";
        bar1.increment();
      } catch (error) {
        errorPageCount++;
        currentRecord.status = "error";
      }
    })
  );

  // write status periodically
  const int = setInterval(async () => {
    if (errorPageCount > ERROR_THRESHOLD) {
      console.log(
        chalk.red`Too many errors, looks like you are being rate limited/IP banned.`
      );
      console.log(chalk.red`Exiting...`);
      process.exit();
    }
    await writeStatus(sitemapRecords);
    multiBar.log(chalk.blue`Writing status file (save progress)...\n`);

    // decay error count
    errorPageCount = errorPageCount > 5 ? errorPageCount - 5 : 0;
  }, 1000 * 10);

  process.on("SIGINT", async () => {
    console.log(chalk.blue`Writing status file (save progress)...\n`);
    await writeStatus(sitemapRecords);
    process.exit();
  });

  await Promise.allSettled(fetchPromises);

  clearInterval(int);
  multiBar.stop();
  process.exit();
};
