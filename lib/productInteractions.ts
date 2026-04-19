import type { ProductInteractionCounts } from "@/types/experiment";

/** スプレッドシート列名・JSON キー共通（1商品画面あたりのタップ回数） */
export const INTERACTION_COUNT_KEYS: (keyof ProductInteractionCounts)[] = [
  "accordion_about",
  "accordion_detail",
  "accordion_spec",
  "accordion_care",
  "favorite_toggle",
  "quantity_plus",
  "quantity_minus",
  "tap_add_to_cart",
];

export function createEmptyInteractionCounts(): ProductInteractionCounts {
  return {
    accordion_about: 0,
    accordion_detail: 0,
    accordion_spec: 0,
    accordion_care: 0,
    favorite_toggle: 0,
    quantity_plus: 0,
    quantity_minus: 0,
    tap_add_to_cart: 0,
  };
}

const ACCORDION_ID_TO_KEY: Record<
  string,
  keyof ProductInteractionCounts
> = {
  about: "accordion_about",
  detail: "accordion_detail",
  spec: "accordion_spec",
  care: "accordion_care",
};

export function bumpAccordionInteraction(
  counts: ProductInteractionCounts,
  sectionId: string
): void {
  const k = ACCORDION_ID_TO_KEY[sectionId];
  if (k) counts[k]++;
}
