"use client";

import {
  IzvedeniObliciAccodion,
  IzvedeniObliciAccodionContent,
  IzvedeniObliciAccodionHeader,
  IzvedeniObliciAccodionItem,
  TableData,
  TableHeader,
  TableRow,
} from "@/components/IzvedeniObliciTables";
import { formatIzvedniObliciKeys } from "@/components/IzvedeniObliciTables/formatIzvendeniObliciKeys";
import { Entries } from "@/utils/types";
import * as Accordion from "@radix-ui/react-accordion";
import { Fragment } from "react";
import { PridjevIzvedeniOblici } from "types";

interface IzvedeniObliciPridjevTableProps {
  children?: React.ReactNode | React.ReactNode[];
  izvedeniOblici?: PridjevIzvedeniOblici;
}

export const IzvedeniObliciPridjevTable = ({
  children,
  izvedeniOblici,
}: IzvedeniObliciPridjevTableProps) => {
  const entries = Object.entries(
    izvedeniOblici ?? {}
  ) as Entries<PridjevIzvedeniOblici>;
  return (
    <Accordion.Root type="multiple">
      {entries.map(([key, value]) => {
        return (
          <IzvedeniObliciAccodionItem value={key} key={key}>
            <IzvedeniObliciAccodionHeader level={0}>
              {formatIzvedniObliciKeys(key)}
            </IzvedeniObliciAccodionHeader>
            <IzvedeniObliciAccodionContent>
              <IzvedeniObliciAccodion>
                {/* broj */}
                {Object.entries(value!).map(([broj, vrijednostBroj], j) => {
                  return (
                    <IzvedeniObliciAccodionItem value={broj} key={broj}>
                      <IzvedeniObliciAccodionHeader level={1}>
                        {formatIzvedniObliciKeys(broj)}
                      </IzvedeniObliciAccodionHeader>
                      <IzvedeniObliciAccodionContent>
                        {/* lice */}
                        {Object.entries(vrijednostBroj).map(
                          ([lice, vrijednostLice], k) => {
                            return (
                              <Fragment key={k}>
                                <TableRow>
                                  <TableHeader fullWidth level={2}>
                                    {formatIzvedniObliciKeys(lice)}
                                  </TableHeader>
                                </TableRow>
                                {/* deklinacija */}
                                {Object.entries(vrijednostLice).map(
                                  ([deklinacija, vrijednostDeklinacija], l) => {
                                    return (
                                      <TableRow key={l}>
                                        <TableHeader level={3}>
                                          {formatIzvedniObliciKeys(deklinacija)}
                                        </TableHeader>
                                        <TableData>
                                          {vrijednostDeklinacija}
                                        </TableData>
                                      </TableRow>
                                    );
                                  }
                                )}
                              </Fragment>
                            );
                          }
                        )}
                      </IzvedeniObliciAccodionContent>
                    </IzvedeniObliciAccodionItem>
                  );
                })}
              </IzvedeniObliciAccodion>
            </IzvedeniObliciAccodionContent>
          </IzvedeniObliciAccodionItem>
        );
      })}
    </Accordion.Root>
  );
};
