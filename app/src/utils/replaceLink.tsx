import { DefinitionInfo } from "@/components/DefinitionInfo";
import { idFromHref } from "@/utils/idFromHref";
import parse, { HTMLReactParserOptions, domToReact } from "html-react-parser";

export function replaceAWithLink(text: string, info = true) {
  const options = {
    replace: ({ name, attribs, children }: any) => {
      if (name === "a") {
        const comp = domToReact(children, options);
        return (
          <DefinitionInfo id={idFromHref(attribs.href)}>{comp}</DefinitionInfo>
        );
      }

      return undefined;
    },
  } as HTMLReactParserOptions;

  return parse(text, options);
}
