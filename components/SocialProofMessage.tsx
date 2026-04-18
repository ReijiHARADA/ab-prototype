"use client";

export function SocialProofMessage({
  text,
  visible,
}: {
  text: string;
  visible: boolean;
}) {
  if (!visible || !text) return null;

  return (
    <p className="text-center text-sm leading-relaxed text-neutral-800">
      {text}
    </p>
  );
}
