"use client";
import * as Accordion from "@radix-ui/react-accordion";
import cn from "classnames";
import { createContext, useContext } from "react";

const AccordionStateContext = createContext({ disabled: false });

// export accordion root
export const DefinicijaAccordionRoot = Accordion.Root;

export const useAccordionState = () => {
  return useContext(AccordionStateContext);
};

interface DefinicijaAccordionTitleProps
  extends Accordion.AccordionTriggerProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const DefinicijaAccordionTitle = ({
  children,
  ...props
}: DefinicijaAccordionTitleProps) => {
  const { disabled } = useAccordionState();

  return (
    <Accordion.Trigger asChild>
      <button
        {...props}
        title={disabled ? "Nema podataka" : "Prikaži"}
        disabled={disabled}
        className={cn("mt-4 border-b transition-[height] duration-200", {
          "border-b-accents-3 text-accents-3": disabled,
          "border-accents-6 text-accents-6 hover:border-background hover:text-accents-9 data-[state=open]:border-accents-9 data-[state=open]:text-accents-9 ":
            !disabled,
        })}
      >
        <div
          className={`h-full w-full bg-transparent pb-1 pl-1 pt-2  text-start text-xl font-semibold`}
        >
          {children}
        </div>
      </button>
    </Accordion.Trigger>
  );
};

interface DefinicijaAccordionContentProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const DefinicijaAccordionContent = ({
  children,
}: DefinicijaAccordionContentProps) => {
  return (
    <Accordion.Content
      className={`overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown`}
    >
      <div className={`overflow-auto px-1 pt-3`}>{children}</div>
    </Accordion.Content>
  );
};

interface DefinicijaAccordionProps extends Accordion.AccordionItemProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const DefinicijaAccordion = ({
  children,
  ...o
}: DefinicijaAccordionProps) => {
  return (
    <AccordionStateContext.Provider value={{ disabled: o?.disabled ?? false }}>
      <Accordion.Item asChild {...o}>
        <section className={`flex flex-col`}>{children}</section>
      </Accordion.Item>
    </AccordionStateContext.Provider>
  );
};
