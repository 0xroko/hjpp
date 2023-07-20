import {
  DefinicijaAccordion,
  DefinicijaAccordionContent,
  DefinicijaAccordionRoot,
  DefinicijaAccordionTitle,
} from "@/components/DefinitionAccordion";
import { IzvedeniObliciGlagolTable } from "@/components/IzvedeniObliciTables/glagol";
import { IzvedeniObliciImenicaTable } from "@/components/IzvedeniObliciTables/imenica";
import { IzvedeniObliciPridjevTable } from "@/components/IzvedeniObliciTables/pridjev";
import { appName } from "@/const";
import { getDefinition } from "@/utils/getDefinition";
import { replaceAWithLink } from "@/utils/replaceLink";
import { Metadata } from "next";
import { RedirectType } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { Definicija } from "types";

// helper function to remove all hmtl tags
function stripHtml(html: string) {
  return html.replace(/(<([^>]+)>)/gi, "");
}

export async function generateMetadata({
  params,
}: {
  params: Pick<Definicija, "id">;
}): Promise<Metadata> {
  const definition = await getDefinition(params.id);

  const rijec = `${definition?.rijec
    ?.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")}`;

  const definicija =
    (typeof definition?.definicija === "string"
      ? definition?.definicija
      : Object.values(definition?.definicija ?? {})
          .slice(0, 4)
          .map((def: any) => stripHtml(def))
          .join(", ")
          .slice(0, 160)) + "...";

  const title = `${rijec} | ${appName}`;
  const description = `${rijec} – ${definicija}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Pick<Definicija, "id">;
}) {
  const id = params.id;
  const definicija = await getDefinition(id);

  if (definicija === null) {
    redirect("/?search=" + id, RedirectType.replace);
  }

  return (
    <>
      <div className={`pt-44`}>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 10vw, 5rem)",
          }}
          className={`mb-2 break-all font-bold leading-tight tracking-tight md:mb-3`}
        >
          {definicija.rijec}
        </h1>
        <p
          className={`text-[1.1rem]  text-accents-6 md:text-xl`}
          dangerouslySetInnerHTML={{ __html: definicija.detalji ?? "" }}
        ></p>
      </div>
      <section className={`py-36`}>
        <div className={``}>
          {typeof definicija.definicija === "string" ? (
            <div className={`text-base text-accents-9`}>
              {replaceAWithLink(definicija.definicija)}
            </div>
          ) : (
            <ol className={`list-inside list-decimal`}>
              {Object.values(definicija.definicija ?? {}).map((def: any, i) => (
                <li className={`text-base text-accents-9 `} key={i}>
                  {replaceAWithLink(def)}
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <DefinicijaAccordionRoot type="multiple">
        <DefinicijaAccordion
          disabled={!definicija.izvedeniOblici}
          value="izvedeniOblici"
        >
          <DefinicijaAccordionTitle>Izvedeni oblici</DefinicijaAccordionTitle>
          <DefinicijaAccordionContent>
            {(() => {
              if (definicija.vrsta === "imenica") {
                return (
                  <IzvedeniObliciImenicaTable
                    izvedeniOblici={definicija.izvedeniOblici}
                  />
                );
              } else if (definicija.vrsta === "glagol") {
                return (
                  <IzvedeniObliciGlagolTable
                    izvedeniOblici={definicija.izvedeniOblici}
                  />
                );
              } else if (definicija.vrsta === "pridjev") {
                return (
                  <IzvedeniObliciPridjevTable
                    izvedeniOblici={definicija.izvedeniOblici}
                  />
                );
              }
              return null;
            })()}
          </DefinicijaAccordionContent>
        </DefinicijaAccordion>
        <DefinicijaAccordion disabled={!definicija.sintagma} value="sintagma">
          <DefinicijaAccordionTitle>Sintagma</DefinicijaAccordionTitle>
          <DefinicijaAccordionContent>
            <ul className={`list-inside text-accents-9 marker:content-['•_']`}>
              {definicija.sintagma?.map((s, i) => {
                return (
                  <li key={i}>
                    <b
                      dangerouslySetInnerHTML={{
                        __html: s.sintagma,
                      }}
                    ></b>
                    {" – "}
                    <span>{replaceAWithLink(s.znacenje ?? "")}</span>
                  </li>
                );
              })}
            </ul>
          </DefinicijaAccordionContent>
        </DefinicijaAccordion>
        <DefinicijaAccordion
          disabled={!definicija.frazeologija}
          value="frazologija"
        >
          <DefinicijaAccordionTitle>Frazologija</DefinicijaAccordionTitle>
          <DefinicijaAccordionContent>
            <ul
              className={`list-inside text-accents-9 marker:content-['•_']`}
              style={{
                textIndent: "-1.5ch",
                marginLeft: "1.5ch",
              }}
            >
              {definicija.frazeologija?.map((s, i) => {
                return (
                  <li className={``} key={i}>
                    <b
                      dangerouslySetInnerHTML={{
                        __html: s.fraza,
                      }}
                    ></b>
                    {" – "}
                    <span>{replaceAWithLink(s.znacenje ?? "")}</span>
                  </li>
                );
              })}
            </ul>
          </DefinicijaAccordionContent>
        </DefinicijaAccordion>
        <DefinicijaAccordion
          disabled={!definicija.onomastika}
          value="onomastika"
        >
          <DefinicijaAccordionTitle>Onomastika</DefinicijaAccordionTitle>
          <DefinicijaAccordionContent>
            <div className={`text-accents-9`}>
              {replaceAWithLink(definicija.onomastika ?? "")}
            </div>
          </DefinicijaAccordionContent>
        </DefinicijaAccordion>
        <DefinicijaAccordion
          disabled={!definicija.etimologija}
          value="etimologija"
        >
          <DefinicijaAccordionTitle>Etimologija</DefinicijaAccordionTitle>
          <DefinicijaAccordionContent>
            <div className={`text-accents-9`}>
              {replaceAWithLink(definicija.etimologija ?? "")}
            </div>
          </DefinicijaAccordionContent>
        </DefinicijaAccordion>
      </DefinicijaAccordionRoot>
    </>
  );
}
