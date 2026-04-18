"use client";

import { cn } from "@/lib/utils";

export function SocialProofMessage({
  text,
  visible,
}: {
  text: string;
  visible: boolean;
}) {
  if (!visible || !text) return null;
  return (
    <div
      className={cn(
        "rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-center text-xs leading-relaxed text-neutral-800"
      )}
    >
      {text}
    </div>
  );
}
