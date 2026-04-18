import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PhoneShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white text-neutral-900",
        className
      )}
    >
      {children}
    </div>
  );
}
