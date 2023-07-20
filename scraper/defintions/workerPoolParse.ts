import chalk from "chalk";
import { MultiBar, Presets } from "cli-progress";
import { writeFile } from "fs/promises";
import { join, resolve } from "path";
import piscina_1 from "piscina";
import { DefinicijaNoId } from "types";
import { MessageChannel } from "worker_threads";
import {
  DEFINITIONS_OUTPUT_FILE,
  DEFINITION_PAGES_PATH,
  HREF_PATH,
  PARSE_TASK_COUNT,
} from "../const";
import { splitIntoEqualArrays } from "../utils";
import { assignIds } from "../utils/assignId";
import { readStatusFile } from "../utils/statusFile";
import { parseDefinitionPage } from "./parse";
import { WorkerStatusMessage } from "./worker";

const progressBars = new MultiBar(
  {
    format: "[{bar}] {percentage}% | {value}/{total} | {speed} it/s",
  },
  Presets.shades_grey
);

const piscina = new piscina_1.Piscina({
  minThreads: PARSE_TASK_COUNT,
  niceIncrement: 0,
  filename: resolve(join(__dirname, "defintions", `worker.ts`)),
  execArgv: ["-r", "esbuild-runner/register"],
  env: {
    // worker resolves wrong path
    DEFINITION_PAGES_PATH: DEFINITION_PAGES_PATH,
  },
});

export const parseDefinitionPages = async () => {
  const sitemapRecords = await readStatusFile();

  const recordsToParse = sitemapRecords.filter((r) => r.status === "fetched");

  console.log(chalk.blue(`Found ${recordsToParse.length} records to parse`));

  const unfetchedRecords = sitemapRecords.filter(
    (r) => r.status === "unfetched"
  );

  if (unfetchedRecords.length > 0) {
    console.log(
      chalk.yellow(
        `Found ${unfetchedRecords.length} records that are not fetched, please run 'fetch def' if you want to fetch them first \n`
      )
    );
  }

  // split into n arrays each will be parsed by a separate worker
  const recordsSliced = splitIntoEqualArrays(recordsToParse, PARSE_TASK_COUNT);

  const taskWProgressBar = recordsSliced.map(async (r) => {
    const taskProgressBar = progressBars.create(r.length, 0);
    const mc = new MessageChannel();

    mc.port2.on("message", (msg: WorkerStatusMessage) => {
      if (msg.type === "progress") {
        taskProgressBar.increment({ speed: msg.speed });
      } else if (msg.type === "done") {
        taskProgressBar.stop();
        progressBars.remove(taskProgressBar);
      }
    });

    mc.port2.unref();

    // start worker
    return await piscina.run(
      {
        data: {
          records: r,
        },
        port: mc.port1,
      },
      {
        transferList: [mc.port1],
      }
    );
  });

  const results = (await Promise.all(taskWProgressBar)) as Awaited<
    ReturnType<typeof parseDefinitionPage>
  >[];

  const definitionsNoId = results
    .flat()
    .filter((d) => d !== null) as DefinicijaNoId[];

  progressBars.stop();

  const parsedDefinitions = assignIds(definitionsNoId);

  /**
   * replace HJP_HREF_ATTR with href and hjpId with our id
   */
  const hjpIdToIdMap = new Map<string, string>();

  parsedDefinitions.forEach((d) => {
    hjpIdToIdMap.set(d.hjp.id, d.id);
  });

  const parsedDefinitionsStringWithHref = JSON.stringify(
    parsedDefinitions,
    null,
    1
  ).replace(/word-id=\\"\S+\\"/g, (match) => {
    const hjpId = match.match(/word-id=\\"(\S+)\\"/);
    if (!hjpId) {
      throw new Error("Could not find hjpId");
    }
    const id = hjpIdToIdMap.get(hjpId[1]);
    return `href=\\"${HREF_PATH}${id}\\"`;
  });

  await writeFile(DEFINITIONS_OUTPUT_FILE, parsedDefinitionsStringWithHref);

  console.log(
    chalk.greenBright(
      `Done parsing ${definitionsNoId.length} definitions, outputting to ${DEFINITIONS_OUTPUT_FILE} \n`
    )
  );
};
