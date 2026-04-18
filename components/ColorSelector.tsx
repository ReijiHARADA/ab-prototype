"use client";

export function ColorSelector({
  value,
  label,
  grayLabel,
}: {
  value: string;
  label: string;
  grayLabel: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <span
          className="inline-block size-9 rounded-full border border-neutral-300 bg-neutral-400"
          aria-hidden
        />
        <span className="text-sm">
          {grayLabel} / {value}
        </span>
      </div>
    </div>
  );
}
