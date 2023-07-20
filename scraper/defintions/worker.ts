require("dotenv").config();
import { SitemapRecordWStatus } from "../const";
import { parseDefinitionPage } from "./parse";

export type DefinitionParseTaskArgs = {
  records: SitemapRecordWStatus[];
};

export type BaseTaskWorkerArgs<T> = {
  port: MessagePort;
  data: T;
};

export type WorkerStatusMessage =
  | {
      type: "progress";
      speed: number;
    }
  | {
      type: "done";
    };

/**
 * Parses an array of definitions and returns the parsed definitions
 * This function will be ran by piscina
 */
export default async ({
  data,
  port,
}: BaseTaskWorkerArgs<DefinitionParseTaskArgs>) => {
  let finishCount = 0,
    time = 0;
  const defs: any[] = [];

  for (let i = 0; i < data.records.length; i++) {
    const startTime = performance.now();

    const def = await parseDefinitionPage(
      data.records[i],
      process.env.DEFINITION_PAGES_PATH!
    );
    defs.push(def);

    // calculate iteration speed
    finishCount++;
    time += performance.now() - startTime;
    const speed = Math.round((finishCount / time) * 1000);
    port.postMessage({
      type: "progress",
      speed,
    } as WorkerStatusMessage);
  }

  // notify we're done
  port.postMessage({
    type: "done",
  } as WorkerStatusMessage);

  return defs;
};
