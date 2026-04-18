"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SectionAccordion({
  items,
}: {
  items: { id: string; title: string; content: string }[];
}) {
  return (
    <Accordion className="w-full border-t border-neutral-200">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-neutral-200">
          <AccordionTrigger className="text-sm font-medium hover:no-underline">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-sm leading-relaxed text-neutral-700">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
