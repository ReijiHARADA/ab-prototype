"use client";

import { Button } from "@/components/ui/button";
import { useExperiment } from "@/context/experiment-context";
import { logEvent } from "@/lib/logger";
import { getMessages } from "@/lib/i18n";

export function CartAddedScreen() {
  const {
    language,
    sessionId,
    currentConditionId,
    cartAddedView,
    setCartAddedView,
    advanceAfterCart,
  } = useExperiment();
  const m = getMessages(language ?? "ja");

  const onViewCart = async () => {
    await logEvent({
      sessionId,
      language: language ?? undefined,
      conditionId: currentConditionId,
      eventName: "cart_cta",
      eventValue: "view_cart_clicked",
      timestamp: new Date().toISOString(),
    });
    setCartAddedView("cartStub");
  };

  if (cartAddedView === "cartStub") {
    return (
      <div className="flex min-h-[50vh] flex-col justify-center gap-6 px-6 py-12">
        <p className="text-sm leading-relaxed text-neutral-700">
          {m.cartStubMessage}
        </p>
        <Button
          type="button"
          className="h-12 w-full rounded-md"
          onClick={() => advanceAfterCart()}
        >
          {m.nextProduct}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col justify-center gap-8 px-6 py-12 text-center">
      <div className="space-y-2">
        <h1 className="text-lg font-medium">{m.cartAddedTitle}</h1>
        <p className="text-sm text-neutral-700">{m.cartAddedBody}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          className="h-12 w-full rounded-md"
          onClick={() => void onViewCart()}
        >
          {m.viewCart}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-md"
          onClick={() => advanceAfterCart()}
        >
          {m.nextProduct}
        </Button>
      </div>
    </div>
  );
}
