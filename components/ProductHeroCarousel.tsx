"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useExperiment } from "@/context/experiment-context";
import { getProductHeroImagePaths } from "@/lib/productHeroImages";
import type { Language } from "@/types/experiment";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ProductHeroCarousel({
  language = "ja",
}: {
  language?: Language;
}) {
  const { userInfo } = useExperiment();
  const m = getMessages(language);

  const paths = useMemo(
    () => getProductHeroImagePaths(userInfo?.gender),
    [userInfo?.gender]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const idx = Math.round(el.scrollLeft / w);
    setActiveIndex(Math.min(Math.max(0, idx), paths.length - 1));
  }, [paths.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateActiveFromScroll();
    const onResize = () => updateActiveFromScroll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paths, updateActiveFromScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = 0;
    setActiveIndex(0);
  }, [paths]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const w = el.clientWidth;
      el.scrollTo({
        left: index * w,
        behavior: "smooth",
      });
    },
    []
  );

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onScroll={updateActiveFromScroll}
        className="flex w-full snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        role="region"
        aria-roledescription="carousel"
        aria-label={m.productHeroCarouselAria}
      >
        {paths.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative shrink-0 snap-center snap-always bg-neutral-100"
            style={{ flex: "0 0 100%", minWidth: "100%", width: "100%" }}
          >
            <div className="relative aspect-square w-full">
              <Image
                src={src}
                alt=""
                fill
                className="object-contain"
                sizes="(max-width: 430px) 100vw, 430px"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 画像内・下部：現在位置インジケーター */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/30 via-black/10 to-transparent px-4 pb-3 pt-10">
        <div className="pointer-events-auto flex items-center gap-2">
          {paths.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={m.productCarouselDotAria(i + 1, paths.length)}
              aria-current={i === activeIndex ? "true" : undefined}
              className={cn(
                "h-2 rounded-full transition-[width,background-color] duration-200",
                i === activeIndex
                  ? "w-7 bg-white shadow-sm"
                  : "w-2 bg-white/75 ring-1 ring-white/40"
              )}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
