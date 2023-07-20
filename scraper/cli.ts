#! /usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import chalk from "chalk";
import { fetchDefinitionPages } from "./defintions/fetch";
import { parseDefinitionPages } from "./defintions/workerPoolParse";
import { fetchAndConvert } from "./sitemap";
import { buildStatusFile, statusFileExists } from "./utils/statusFile";

yargs(hideBin(process.argv))
  .scriptName("hjpp")
  .usage("$0 <cmd> [args]")
  .command(
    "sitemap",
    "fetch all sitemaps and convert them single to JSON (sitemap.json)",
    (yargs) => {},
    async function (argv) {
      await fetchAndConvert();

      await buildStatusFile("unfetched");
    }
  )
  .command(
    "fetch",
    "fetch all definition pages, progress is saved (status.json)",
    (yargs) => {
      yargs.option("force", {
        alias: "f",
        describe: "force fetch all definitions",
        type: "boolean",
      });
    },
    async function (argv) {
      if (argv.force) {
        console.log(
          chalk.redBright`Using --force, all fetch progress will be lost\n`
        );
        await buildStatusFile("unfetched");
        console.log(chalk.redBright`Refetching all definitions\n`);
      }
      if (!statusFileExists()) {
        console.error(
          chalk.red("status.json doesn't exist, did you run `sitemap`")
        );
      }
      await fetchDefinitionPages();
    }
  )
  .command(
    "parse",
    "parse all definitions from HJP, note: progress is not saved",
    (yargs) => {},
    async function (argv) {
      await parseDefinitionPages();
    }
  )
  .command(
    "status <newStatus>",
    "manually set status of all records, useful for debugging",
    (yargs) => {
      yargs.positional("newStatus", {
        describe: "new status to set",
        type: "string",
        choices: ["unfetched", "fetched", "parsed"],
      });
    },
    async function (argv) {
      if (argv.newStatus) {
        await buildStatusFile(argv.newStatus as any);
      }
    }
  )

  .help()
  .alias("-h", "--help")
  .showHelpOnFail(true).argv;
