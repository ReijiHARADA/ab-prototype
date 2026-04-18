"use client";

import { BodyTypeResult } from "@/components/BodyTypeResult";
import { CartAddedScreen } from "@/components/CartAddedScreen";
import { LanguageSelect } from "@/components/LanguageSelect";
import { PhoneShell } from "@/components/PhoneShell";
import { ProductDetail } from "@/components/ProductDetail";
import { ResultDashboard } from "@/components/ResultDashboard";
import { UserInfoForm } from "@/components/UserInfoForm";
import { useExperiment } from "@/context/experiment-context";

export function ExperimentFlow() {
  const { step, language } = useExperiment();

  return (
    <PhoneShell>
      {step === "language" && <LanguageSelect />}
      {step === "userInfo" && language && (
        <UserInfoForm key={language} />
      )}
      {step === "bodyType" && language && <BodyTypeResult />}
      {step === "product" && language && <ProductDetail />}
      {step === "cartAdded" && language && <CartAddedScreen />}
      {step === "completed" && language && <ResultDashboard />}
    </PhoneShell>
  );
}
