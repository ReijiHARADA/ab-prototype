"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Search,
  ShoppingBag,
} from "lucide-react";

import { ProductHeroCarousel } from "@/components/ProductHeroCarousel";
import { QuantitySelector } from "@/components/QuantitySelector";
import { SectionAccordion } from "@/components/SectionAccordion";
import { SocialProofMessage } from "@/components/SocialProofMessage";
import { Button } from "@/components/ui/button";
import {
  PATTERN_MS,
  useExperiment,
} from "@/context/experiment-context";
import { ADMIN_RESET_QUANTITY } from "@/lib/experiment";
import {
  bumpAccordionInteraction,
  createEmptyInteractionCounts,
} from "@/lib/productInteractions";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ProductDetail() {
  const {
    language,
    socialProofSegments,
    currentConditionId,
    completePattern,
    resetExperiment,
    patternStartedAt,
    conditionIndex,
  } = useExperiment();

  const completePatternRef = useRef(completePattern);
  useEffect(() => {
    completePatternRef.current = completePattern;
  }, [completePattern]);

  const resetExperimentRef = useRef(resetExperiment);
  useEffect(() => {
    resetExperimentRef.current = resetExperiment;
  }, [resetExperiment]);

  const lang = language ?? "ja";
  const m = getMessages(lang);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const interactionCountsRef = useRef(createEmptyInteractionCounts());

  useEffect(() => {
    setIsFavorite(false);
    interactionCountsRef.current = createEmptyInteractionCounts();
  }, [conditionIndex]);

  const selectionsRef = useRef({
    size: "M" as string,
    quantity: 1,
  });
  useEffect(() => {
    selectionsRef.current = { size: "M", quantity };
  }, [quantity]);

  const finishedRef = useRef(false);
  const runFinish = useCallback((action: "timeout" | "back" | "add_to_cart") => {
    if (finishedRef.current) return;
    if (
      action === "add_to_cart" &&
      selectionsRef.current.quantity === ADMIN_RESET_QUANTITY
    ) {
      finishedRef.current = true;
      resetExperimentRef.current();
      return;
    }
    if (action === "add_to_cart") {
      interactionCountsRef.current.tap_add_to_cart++;
    }
    finishedRef.current = true;
    const { size: sz, quantity: q } = selectionsRef.current;
    completePatternRef.current({
      action:
        action === "add_to_cart"
          ? "add_to_cart"
          : action === "back"
            ? "back"
            : "timeout",
      selectedSize: sz,
      quantity: q,
      interactionCounts: { ...interactionCountsRef.current },
    });
  }, []);

  useEffect(() => {
    finishedRef.current = false;
    if (!patternStartedAt) return;
    const started = new Date(patternStartedAt).getTime();
    const elapsed = Date.now() - started;
    const remaining = Math.max(0, PATTERN_MS - elapsed);
    const id = setTimeout(() => {
      void runFinish("timeout");
    }, remaining);
    return () => clearTimeout(id);
  }, [patternStartedAt, conditionIndex, runFinish]);

  const showProof = currentConditionId !== "none";

  const accordionItems = [
    { id: "about", title: m.aboutProduct, content: m.productDesc },
    { id: "detail", title: m.details, content: m.productDetailBody },
    { id: "spec", title: m.specs, content: m.productSpecsBody },
    { id: "care", title: m.materialCare, content: m.productMaterialCareBody },
  ];

  return (
    <div className="flex min-h-dvh flex-col pb-6">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white px-3 py-3">
        <button
          type="button"
          className="rounded p-2"
          aria-label="back"
          onClick={() => runFinish("back")}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center">
          <button type="button" className="rounded p-2 opacity-40" aria-hidden>
            <Search className="size-5" />
          </button>
          <button type="button" className="rounded p-2 opacity-40" aria-hidden>
            <ShoppingBag className="size-5" />
          </button>
        </div>
      </header>

      <ProductHeroCarousel language={lang} />

      <div className="flex flex-col gap-6 px-4 pt-6">
        <div className="space-y-2">
          <h1 className="text-lg font-medium leading-snug">{m.productName}</h1>
          <p className="text-base font-medium tabular-nums">{m.productPrice}</p>
          <p className="text-xs text-emerald-800">{m.productInStock}</p>
        </div>

        <QuantitySelector
          label={m.quantity}
          value={quantity}
          onChange={(n) => {
            if (n > quantity) interactionCountsRef.current.quantity_plus++;
            if (n < quantity) interactionCountsRef.current.quantity_minus++;
            setQuantity(n);
          }}
        />

        <div className="space-y-3 pt-2">
          <SocialProofMessage
            segments={socialProofSegments}
            visible={showProof}
          />
          <Button
            type="button"
            className="h-12 w-full rounded-md text-base"
            onClick={() => runFinish("add_to_cart")}
          >
            {m.addToCart}
          </Button>
        </div>

        <button
          type="button"
          aria-pressed={isFavorite}
          className={cn(
            "flex touch-manipulation items-center justify-center gap-2 rounded-md border py-3 text-sm transition-colors duration-200",
            isFavorite
              ? "border-rose-300 bg-white text-rose-700"
              : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100"
          )}
          onClick={() => {
            interactionCountsRef.current.favorite_toggle++;
            setIsFavorite((v) => !v);
          }}
        >
          <Heart
            className={cn(
              "size-4 shrink-0 transition-colors duration-200",
              isFavorite ? "fill-rose-500 text-rose-500" : "text-neutral-600"
            )}
            fill={isFavorite ? "currentColor" : "none"}
          />
          {m.addToFavorites}
        </button>

        <div className="w-full border-b border-neutral-200 py-3">
          <p className="text-sm font-medium text-neutral-900">{m.storeStock}</p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">
            {m.storeStockPlaceholder}
          </p>
        </div>

        <SectionAccordion
          items={accordionItems}
          onSectionInteract={(id) =>
            bumpAccordionInteraction(interactionCountsRef.current, id)
          }
        />
      </div>
    </div>
  );
}
