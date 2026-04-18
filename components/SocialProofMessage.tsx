"use client";

import type { SocialProofSegment } from "@/lib/socialProofText";

export function SocialProofMessage({
  segments,
  visible,
}: {
  segments: SocialProofSegment[];
  visible: boolean;
}) {
  if (!visible || segments.length === 0) return null;

  return (
    <p className="text-center text-sm leading-relaxed text-neutral-800">
      {segments.map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="font-semibold text-neutral-900">
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  );
}
