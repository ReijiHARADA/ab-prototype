"use client";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"] as const;

export function SizeSelector({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">
        {label}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`border px-2 py-2 text-xs ${
              value === s
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-900"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
