"use client";

import Image from "next/image";

import { PRODUCT_HERO_IMAGE_PATHS } from "@/lib/productHeroImages";
import type { Language } from "@/types/experiment";
import { getMessages } from "@/lib/i18n";

export function ProductHeroCarousel({
  language = "ja",
}: {
  language?: Language;
}) {
  const m = getMessages(language);

  return (
    <div
      className="flex w-full snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: "touch" }}
      role="region"
      aria-roledescription="carousel"
      aria-label={m.productHeroCarouselAria}
    >
      {PRODUCT_HERO_IMAGE_PATHS.map((src, i) => (
        <div
          key={src}
          className="relative shrink-0 snap-center snap-always overflow-hidden bg-neutral-200"
          style={{ flex: "0 0 100%", minWidth: "100%", width: "100%" }}
        >
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 430px) 100vw, 430px"
              priority={i === 0}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
