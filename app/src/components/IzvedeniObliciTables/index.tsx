"use client";
import * as Accordion from "@radix-ui/react-accordion";

interface TableRowProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const TableRow = ({ children }: TableRowProps) => {
  return (
    <div
      className={`flex w-full border-b border-b-accents-2 dark:border-b-accents-1/30`}
    >
      {children}
    </div>
  );
};

interface TableHeaderProps {
  children?: React.ReactNode | React.ReactNode[];
  fullWidth?: boolean;
  level?: number;
}

export const TableHeader = ({
  children,
  fullWidth,
  level,
}: TableHeaderProps) => {
  return (
    <div
      className={`${
        fullWidth
          ? "grow-1 basis-[100%]"
          : "min-w-0 shrink-0 grow-0 basis-[50%] text-ellipsis sm:basis-[30%] md:basis-[26%]"
      } flex border-accents-2 pr-2 text-left font-medium`}
    >
      <div
        style={{
          ["--level" as any]: `calc(${level} * 1rem + 2px)`,
          ["--levelSm" as any]: `calc(${level} * 0.75rem + 2px)`,
        }}
        className={`w-full truncate pl-[--levelSm] sm:pl-[--level]`}
      >
        {children}
      </div>
    </div>
  );
};

interface TableDataProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const TableData = ({ children }: TableDataProps) => {
  return <div className={``}>{children}</div>;
};

/**
 * ACCORDION COMPONENTS (extension of Table components)
 */

interface IzvedeniObliciAccodionProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const IzvedeniObliciAccodion = ({
  children,
}: IzvedeniObliciAccodionProps) => {
  return <Accordion.Root type="multiple">{children}</Accordion.Root>;
};

interface IzvedeniObliciAccodionItemProps extends Accordion.AccordionItemProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const IzvedeniObliciAccodionItem = ({
  children,
  ...p
}: IzvedeniObliciAccodionItemProps) => {
  return (
    <Accordion.Item {...p} asChild>
      <div
        className={`flex flex-col transition-colors duration-300 hover:!text-accents-9 data-[state=closed]:text-accents-6 data-[state=open]:text-accents-9 dark:data-[state=closed]:text-accents-6 `}
      >
        {children}
      </div>
    </Accordion.Item>
  );
};

interface IzvedeniObliciAccodionContentProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const IzvedeniObliciAccodionContent = ({
  children,
}: IzvedeniObliciAccodionContentProps) => {
  return (
    <Accordion.Content
      className={`overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown`}
    >
      {children}
    </Accordion.Content>
  );
};

interface IzvedeniObliciAccodionHeaderProps {
  children?: React.ReactNode | React.ReactNode[];
  level?: number;
}

export const IzvedeniObliciAccodionHeader = ({
  children,
  level = 1,
}: IzvedeniObliciAccodionHeaderProps) => {
  return (
    <Accordion.Trigger>
      <TableRow>
        <TableHeader fullWidth level={level}>
          {children}
        </TableHeader>
      </TableRow>
    </Accordion.Trigger>
  );
};
