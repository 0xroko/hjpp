"use client";

import { getDefinition } from "@/utils/getDefinition";
import * as HoverCardRa from "@radix-ui/react-hover-card";
import parse, { HTMLReactParserOptions, domToReact } from "html-react-parser";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Definicija } from "types";

// client version of replaceAWithLink
export function replaceAWithLinkClient(text: string) {
  const options = {
    replace: ({ name, attribs, children }: any) => {
      if (name === "a") {
        return (
          <Link
            href={attribs.href}
            className={`group relative underline underline-offset-2`}
          >
            {domToReact(children, options)}
          </Link>
        );
      }

      return undefined;
    },
  } as HTMLReactParserOptions;

  return parse(text, options);
}

interface DefinitionInfoProps {
  children: ReactNode[] | ReactNode | string | string;
  id: string;
  options?: any;
}

export const DefinitionInfo = ({ children, id }: DefinitionInfoProps) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  const [definition, setDefinition] = useState<Definicija | null>(null);

  useEffect(() => {
    if (!inView) return;
    const get = async () => {
      const d = await getDefinition(id);
      setDefinition(d);
    };

    get();
  }, [inView, id]);

  const html =
    typeof definition?.definicija === "string"
      ? definition?.definicija
      : Object.values(definition?.definicija ?? {}).join("<br>") ?? "";

  return (
    <HoverCardRa.Root openDelay={200} closeDelay={150}>
      <HoverCardRa.Trigger asChild>
        <Link
          ref={ref}
          href={"/r/" + id}
          data-react={"pass"}
          className={`group relative underline underline-offset-2`}
        >
          {children}
        </Link>
      </HoverCardRa.Trigger>
      <HoverCardRa.Portal>
        {definition && (
          <HoverCardRa.Content asChild side="top" align="center" sideOffset={2}>
            <div
              className={`mx-2 w-max max-w-[70%] rounded-md bg-accents-0 bg-opacity-50 p-4 text-accents-9 shadow-lg backdrop-blur-[8px] data-[side="bottom"]:animate-slideUpAndFade data-[side="top"]:animate-slideDownAndFade data-[state="closed"]:animate-fadeOut dark:bg-opacity-70 dark:shadow-accents-0/50 md:max-w-lg`}
            >
              <h3 className={`mb-1 text-lg font-medium`}>
                {definition?.rijec}
              </h3>
              {typeof definition.definicija === "string" ? (
                <div className={`text-base text-accents-9`}>
                  {replaceAWithLinkClient(definition.definicija)}
                </div>
              ) : (
                <ol className={`list-inside list-decimal `}>
                  {Object.values(definition.definicija ?? {}).map(
                    (def: any, i) => (
                      <li className={`text-base text-accents-9 `} key={i}>
                        {replaceAWithLinkClient(def)}
                      </li>
                    )
                  )}
                </ol>
              )}
            </div>
          </HoverCardRa.Content>
        )}
      </HoverCardRa.Portal>
    </HoverCardRa.Root>
  );
};
