"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Search,
  ShoppingBag,
} from "lucide-react";

import { ColorSelector } from "@/components/ColorSelector";
import { QuantitySelector } from "@/components/QuantitySelector";
import { SectionAccordion } from "@/components/SectionAccordion";
import { SizeSelector } from "@/components/SizeSelector";
import { SocialProofMessage } from "@/components/SocialProofMessage";
import { Button } from "@/components/ui/button";
import {
  PATTERN_MS,
  useExperiment,
} from "@/context/experiment-context";
import { getMessages } from "@/lib/i18n";
export function ProductDetail() {
  const {
    language,
    socialProofText,
    currentConditionId,
    completePattern,
    patternStartedAt,
    conditionIndex,
  } = useExperiment();

  const completePatternRef = useRef(completePattern);
  useEffect(() => {
    completePatternRef.current = completePattern;
  }, [completePattern]);

  const lang = language ?? "ja";
  const m = getMessages(lang);

  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const color = "GRAY";
  const [imgError, setImgError] = useState(false);

  const selectionsRef = useRef({ size: "M" as string, quantity: 1, color });
  useEffect(() => {
    selectionsRef.current = { size, quantity, color };
  }, [size, quantity, color]);

  const finishedRef = useRef(false);
  const runFinish = useCallback(async (action: "timeout" | "back" | "add_to_cart") => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const { size: sz, quantity: q, color: c } = selectionsRef.current;
    await completePatternRef.current({
      action:
        action === "add_to_cart"
          ? "add_to_cart"
          : action === "back"
            ? "back"
            : "timeout",
      selectedSize: sz,
      selectedColor: c,
      quantity: q,
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
    {
      id: "about",
      title: m.aboutProduct,
      content: m.productDesc,
    },
    {
      id: "detail",
      title: m.details,
      content:
        lang === "ja"
          ? "着丈・身幅などの採寸情報は参考値です。"
          : "기장·가슴둘레 등 치수 정보는 참고용입니다.",
    },
    {
      id: "spec",
      title: m.specs,
      content:
        lang === "ja"
          ? "綿60％／ポリエステル40％"
          : "면 60% / 폴리에스터 40%",
    },
    {
      id: "care",
      title: m.materialCare,
      content:
        lang === "ja"
          ? "洗濯機洗い可。漂白不可。乾燥機は低温で。"
          : "세탁기 사용 가능. 표백 금지. 건조기는 저온.",
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col pb-6">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white px-3 py-3">
        <button
          type="button"
          className="rounded p-2"
          aria-label="back"
          onClick={() => void runFinish("back")}
        >
          <ArrowLeft className="size-5" />
        </button>
        <button type="button" className="rounded p-2 opacity-40" aria-hidden>
          <Search className="size-5" />
        </button>
        <button type="button" className="rounded p-2 opacity-40" aria-hidden>
          <ShoppingBag className="size-5" />
        </button>
      </header>

      <div className="relative aspect-[3/4] w-full bg-neutral-200">
        {!imgError ? (
          <Image
            src="/product-main.jpg"
            alt={m.productName}
            fill
            className="object-cover"
            sizes="430px"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
            Image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 px-4 pt-6">
        <div className="space-y-2">
          <h1 className="text-lg font-medium leading-snug">{m.productName}</h1>
          <p className="text-base font-medium tabular-nums">{m.productPrice}</p>
          <p className="text-xs text-emerald-800">{m.productInStock}</p>
        </div>

        <ColorSelector value={color} label={m.color} grayLabel={m.colorGray} />

        <SizeSelector label={m.size} value={size} onChange={setSize} />

        <QuantitySelector
          label={m.quantity}
          value={quantity}
          onChange={setQuantity}
        />

        <div className="space-y-3 pt-2">
          <SocialProofMessage
            text={socialProofText}
            visible={showProof}
          />
          <Button
            type="button"
            className="h-12 w-full rounded-md text-base"
            onClick={() => void runFinish("add_to_cart")}
          >
            {m.addToCart}
          </Button>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 border border-neutral-200 py-3 text-sm"
          onClick={() => {}}
        >
          <Heart className="size-4" />
          {m.addToFavorites}
        </button>

        <button
          type="button"
          className="w-full border-b border-neutral-200 py-3 text-left text-sm"
          onClick={() => {}}
        >
          {m.storeStock}
        </button>

        <SectionAccordion items={accordionItems} />
      </div>
    </div>
  );
}
