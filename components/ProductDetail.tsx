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
import { useExperiment } from "@/context/experiment-context";
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
    patternDurationMs,
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
  const [cartConfirmOpen, setCartConfirmOpen] = useState(false);
  const [firstNoneInterstitialOpen, setFirstNoneInterstitialOpen] =
    useState(false);

  const interactionCountsRef = useRef(createEmptyInteractionCounts());

  const isFirstNoneScreen =
    conditionIndex === 0 && currentConditionId === "none";

  const elapsedMs = useCallback(() => {
    if (!patternStartedAt) return 0;
    return Math.max(0, Date.now() - new Date(patternStartedAt).getTime());
  }, [patternStartedAt]);

  const showFirstNoneEarlyInterstitial = useCallback(() => {
    setCartConfirmOpen(false);
    setFirstNoneInterstitialOpen(true);
  }, []);

  useEffect(() => {
    setIsFavorite(false);
    setCartConfirmOpen(false);
    setFirstNoneInterstitialOpen(false);
    interactionCountsRef.current = createEmptyInteractionCounts();
  }, [conditionIndex]);

  useEffect(() => {
    if (!cartConfirmOpen && !firstNoneInterstitialOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (cartConfirmOpen) setCartConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [cartConfirmOpen, firstNoneInterstitialOpen]);

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

  const handleBack = useCallback(() => {
    if (finishedRef.current) return;
    if (
      isFirstNoneScreen &&
      elapsedMs() < patternDurationMs
    ) {
      showFirstNoneEarlyInterstitial();
      return;
    }
    runFinish("back");
  }, [
    isFirstNoneScreen,
    elapsedMs,
    patternDurationMs,
    showFirstNoneEarlyInterstitial,
    runFinish,
  ]);

  const confirmAddToCart = useCallback(() => {
    if (finishedRef.current) return;
    setCartConfirmOpen(false);
    if (selectionsRef.current.quantity === ADMIN_RESET_QUANTITY) {
      finishedRef.current = true;
      resetExperimentRef.current();
      return;
    }
    if (
      isFirstNoneScreen &&
      elapsedMs() < patternDurationMs
    ) {
      showFirstNoneEarlyInterstitial();
      return;
    }
    runFinish("add_to_cart");
  }, [
    isFirstNoneScreen,
    elapsedMs,
    patternDurationMs,
    showFirstNoneEarlyInterstitial,
    runFinish,
  ]);

  useEffect(() => {
    finishedRef.current = false;
    if (!patternStartedAt) return;
    const started = new Date(patternStartedAt).getTime();
    const elapsed = Date.now() - started;
    const remaining = Math.max(0, patternDurationMs - elapsed);
    const id = setTimeout(() => {
      void runFinish("timeout");
    }, remaining);
    return () => clearTimeout(id);
  }, [patternStartedAt, conditionIndex, patternDurationMs, runFinish]);

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
          onClick={handleBack}
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
            onClick={() => setCartConfirmOpen(true)}
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

      {cartConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="close"
            onClick={() => setCartConfirmOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-confirm-title"
          >
            <h2
              id="cart-confirm-title"
              className="text-center text-base font-semibold leading-snug text-neutral-900"
            >
              {m.addToCartConfirmTitle}
            </h2>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 min-h-12 flex-1 rounded-xl text-base"
                onClick={() => setCartConfirmOpen(false)}
              >
                {m.addToCartConfirmBack}
              </Button>
              <Button
                type="button"
                className="h-12 min-h-12 flex-1 rounded-xl text-base"
                onClick={() => void confirmAddToCart()}
              >
                {m.addToCartConfirmSubmit}
              </Button>
            </div>
          </div>
        </div>
      )}

      {firstNoneInterstitialOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[70] flex min-h-dvh flex-col items-center justify-center gap-6 bg-black/50 p-6"
          role="dialog"
          aria-modal="true"
          aria-describedby="first-none-notice"
          aria-live="polite"
          onClick={() => setFirstNoneInterstitialOpen(false)}
        >
          <p
            id="first-none-notice"
            className="pointer-events-none max-w-md text-center text-sm leading-relaxed text-white"
          >
            {m.firstNoneEarlyActionMessage}
          </p>
          <p className="pointer-events-none text-center text-xs font-medium text-white/85">
            {m.firstNoneEarlyActionTapHint}
          </p>
        </button>
      )}
    </div>
  );
}
