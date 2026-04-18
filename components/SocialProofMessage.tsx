"use client";

import Image from "next/image";

import { SOCIAL_PROOF_IMAGE_PATHS } from "@/lib/socialProofImages";
import { getMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Language } from "@/types/experiment";

export function SocialProofMessage({
  text,
  visible,
  language = "ja",
}: {
  text: string;
  visible: boolean;
  language?: Language;
}) {
  if (!visible) return null;

  const m = getMessages(language);

  return (
    <div
      className={cn(
        "rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3 text-neutral-800"
      )}
    >
      <div
        className="mb-3 grid snap-x snap-mandatory grid-flow-col auto-cols-[100%] gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        role="region"
        aria-roledescription="carousel"
        aria-label={m.socialProofCarouselAria}
      >
        {SOCIAL_PROOF_IMAGE_PATHS.map((src, i) => (
          <div
            key={src}
            className="relative aspect-square min-h-0 w-full snap-center snap-always overflow-hidden rounded-md border border-neutral-200/80 bg-neutral-100"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 430px) 92vw, 360px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      {text ? (
        <p className="text-center text-xs leading-relaxed text-neutral-800">
          {text}
        </p>
      ) : null}
    </div>
  );
}
