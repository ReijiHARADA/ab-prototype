"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SectionAccordion({
  items,
  onSectionInteract,
}: {
  items: { id: string; title: string; content: string }[];
  /** アコーディオンの見出しがタップされるたびに呼ぶ（開閉どちらもカウント） */
  onSectionInteract?: (sectionId: string) => void;
}) {
  return (
    <Accordion multiple className="w-full border-t border-neutral-200">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="border-neutral-200">
          <AccordionTrigger
            className="text-sm font-medium hover:no-underline"
            onClick={() => onSectionInteract?.(item.id)}
          >
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="whitespace-pre-line pb-4 text-sm leading-relaxed text-neutral-700">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
