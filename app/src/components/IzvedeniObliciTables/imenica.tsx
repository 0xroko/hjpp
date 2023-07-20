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
import { DefinicijaImenica, Padezi } from "types";

interface IzvedeniObliciImenicaTableProps {
  children?: React.ReactNode | React.ReactNode[];
  izvedeniOblici?: DefinicijaImenica["izvedeniOblici"];
}

export const IzvedeniObliciImenicaTable = ({
  children,
  izvedeniOblici,
}: IzvedeniObliciImenicaTableProps) => {
  const entries = Object.entries(izvedeniOblici ?? {}) as Entries<
    DefinicijaImenica["izvedeniOblici"]
  >;

  return (
    <IzvedeniObliciAccodion>
      {entries.map((v, i) => {
        const padez = v?.[0];
        const padeziArray = Object.entries(v?.[1] ?? {}) as Entries<Padezi>;

        return (
          <IzvedeniObliciAccodionItem value={padez!} key={padez}>
            <IzvedeniObliciAccodionHeader level={0}>
              {formatIzvedniObliciKeys(padez)}
            </IzvedeniObliciAccodionHeader>
            <IzvedeniObliciAccodionContent>
              {padeziArray.map((v, j) => {
                return (
                  <TableRow key={j}>
                    <TableHeader level={1}>{v?.[0]}</TableHeader>
                    <TableData>{v?.[1]}</TableData>
                  </TableRow>
                );
              })}
            </IzvedeniObliciAccodionContent>
          </IzvedeniObliciAccodionItem>
        );
      })}
    </IzvedeniObliciAccodion>
  );
};
