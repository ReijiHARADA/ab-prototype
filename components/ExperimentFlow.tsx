"use client";

import { BodyTypeResult } from "@/components/BodyTypeResult";
import { LanguageSelect } from "@/components/LanguageSelect";
import { PatternSelectScreen } from "@/components/PatternSelectScreen";
import { PhoneShell } from "@/components/PhoneShell";
import { ProductDetail } from "@/components/ProductDetail";
import { ResultDashboard } from "@/components/ResultDashboard";
import { SurveyPromptScreen } from "@/components/SurveyPromptScreen";
import { UserInfoForm } from "@/components/UserInfoForm";
import { useExperiment } from "@/context/experiment-context";

export function ExperimentFlow() {
  const { step, language } = useExperiment();

  return (
    <PhoneShell>
      {step === "language" && <LanguageSelect />}
      {step === "patternSelect" && language && (
        <PatternSelectScreen key={language} />
      )}
      {step === "userInfo" && language && (
        <UserInfoForm key={language} />
      )}
      {step === "bodyType" && language && <BodyTypeResult />}
      {step === "surveyPrompt" && language && <SurveyPromptScreen />}
      {step === "product" && language && <ProductDetail />}
      {step === "completed" && language && <ResultDashboard />}
    </PhoneShell>
  );
}
