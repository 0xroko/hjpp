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
import { Fragment } from "react";
import { GlagolIzvedeniOblici } from "types";

interface IzvedeniObliciGlagolTableProps {
  children?: React.ReactNode | React.ReactNode[];
  izvedeniOblici?: GlagolIzvedeniOblici;
}

export const IzvedeniObliciGlagolTable = ({
  izvedeniOblici,
}: IzvedeniObliciGlagolTableProps) => {
  const entries = Object.entries(
    izvedeniOblici ?? {}
  ) as Entries<GlagolIzvedeniOblici>;

  return (
    <IzvedeniObliciAccodion>
      {entries.map((entry) => {
        const glVrijeme = entry?.[0];
        let vrijednosti = entry?.[1];

        if (Array.isArray(vrijednosti)) {
          vrijednosti = vrijednosti.join(", ");
        }

        if (typeof vrijednosti === "string") {
          return (
            <TableRow key={glVrijeme}>
              <TableHeader level={0}>
                {formatIzvedniObliciKeys(glVrijeme)}
              </TableHeader>
              <TableData>{vrijednosti}</TableData>
            </TableRow>
          );
        }

        return (
          <IzvedeniObliciAccodionItem value={glVrijeme ?? ""} key={glVrijeme}>
            <IzvedeniObliciAccodionHeader level={0}>
              {formatIzvedniObliciKeys(glVrijeme)}
            </IzvedeniObliciAccodionHeader>

            <IzvedeniObliciAccodionContent>
              {/* broj */}
              {Object.entries(vrijednosti!).map(([broj, vrijednostBroj], j) => {
                return (
                  <Fragment key={broj}>
                    <TableRow>
                      <TableHeader fullWidth level={1}>
                        {formatIzvedniObliciKeys(broj)}
                      </TableHeader>
                    </TableRow>
                    {/* lice */}
                    {Object.entries(vrijednostBroj).map(
                      ([lice, vrijednostLice], k) => {
                        return (
                          <TableRow key={k}>
                            <TableHeader level={2}>
                              {formatIzvedniObliciKeys(lice)}
                            </TableHeader>
                            <TableData>{vrijednostLice}</TableData>
                          </TableRow>
                        );
                      }
                    )}
                  </Fragment>
                );
              })}
            </IzvedeniObliciAccodionContent>
          </IzvedeniObliciAccodionItem>
        );
      })}
    </IzvedeniObliciAccodion>
  );
};
