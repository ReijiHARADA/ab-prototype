"use client";

import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 py-4">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded border border-neutral-300 p-1"
          aria-label="minus"
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-[2ch] text-center text-sm tabular-nums">
          {value}
        </span>
        <button
          type="button"
          className="rounded border border-neutral-300 p-1"
          aria-label="plus"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
