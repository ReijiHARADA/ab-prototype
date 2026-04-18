"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CONDITION_ORDER, getConditionIdAtIndex } from "@/lib/experiment";
import { getMessages } from "@/lib/i18n";
import { logPatternResult } from "@/lib/logger";
import { getSocialProofText } from "@/lib/socialProofText";
import type {
  AppStep,
  CartAddedView,
  ConditionId,
  Language,
  PatternAction,
  PatternLog,
  UserInfo,
} from "@/types/experiment";

const STORAGE_KEY = "ab-experiment-state-v1";

interface PersistedV1 {
  version: 1;
  sessionId: string;
  language: Language;
  userInfo: UserInfo;
  step: AppStep;
  conditionIndex: number;
  experimentStartedAt: string;
  cartAddedView: CartAddedView;
  /** 商品画面の開始（タイマー再開用） */
  patternStartedAt: string;
}

function loadPersisted(): Partial<PersistedV1> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedV1>;
  } catch {
    return null;
  }
}

function savePersisted(data: PersistedV1): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearPersisted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function newSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** 同一パターン内で固定の「閲覧者数」（決定的なハッシュ） */
function viewerFromSession(sessionId: string, conditionIndex: number): number {
  const s = `${sessionId}:${conditionIndex}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 18 + (Math.abs(h) % (96 - 18 + 1));
}

function userInfoForLog(u: UserInfo, lang: Language): PatternLog["userInfo"] {
  const m = getMessages(lang);
  return {
    ageGroup: m.ages[u.ageGroup],
    gender: m.genders[u.gender],
    region: m.regions[u.region],
    designTags: u.designTags.map((t) => m.designTags[t]),
    height: u.heightCm,
    weight: u.weightKg,
    bmi: Math.round(u.bmi * 100) / 100,
    bodyType: m.bodyTypeLabels[u.bodyType],
  };
}

interface ExperimentContextValue {
  language: Language | null;
  setLanguage: (l: Language) => void;
  userInfo: UserInfo | null;
  setUserInfoDraft: (u: UserInfo) => void;
  submitUserInfo: (u: UserInfo) => void;
  step: AppStep;
  goProductFromBodyType: () => void;
  conditionIndex: number;
  totalConditions: number;
  currentConditionId: ConditionId;
  socialProofText: string;
  viewerCountForPattern: number;
  useHeightForBodyType: boolean;
  sessionId: string;
  experimentStartedAt: string | null;
  patternStartedAt: string | null;
  sessionPatternLogs: PatternLog[];
  cartAddedView: CartAddedView;
  setCartAddedView: (v: CartAddedView) => void;
  /** パターン離脱（timeout/back/add_to_cart のうちログに残す直前まで） */
  completePattern: (args: {
    action: PatternAction;
    actionDetail?: string;
    selectedSize: string;
    selectedColor: string;
    quantity: number;
  }) => Promise<void>;
  /** カート画面から次のパターン */
  advanceAfterCart: () => void;
  resetExperiment: () => void;
}

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

const PATTERN_MS = 120_000;

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [step, setStep] = useState<AppStep>("language");
  const [conditionIndex, setConditionIndex] = useState(0);
  const [sessionId, setSessionId] = useState(() => newSessionId());
  const [experimentStartedAt, setExperimentStartedAt] = useState<string | null>(
    null
  );
  const [patternStartedAt, setPatternStartedAt] = useState<string | null>(
    null
  );
  const patternStartedAtRef = useRef<string>(new Date().toISOString());
  const [sessionPatternLogs, setSessionPatternLogs] = useState<PatternLog[]>(
    []
  );
  const [cartAddedView, setCartAddedView] =
    useState<CartAddedView>("summary");

  const hydratedRef = useRef(false);

  /* localStorage から実験の再開用に復元（クライアント専用） */
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const p = loadPersisted();
    if (!p?.sessionId) return;
    /* eslint-disable react-hooks/set-state-in-effect -- マウント時の一度限りの復元 */
    setSessionId(p.sessionId);
    if (p.language) setLanguageState(p.language);
    if (p.userInfo) setUserInfo(p.userInfo);
    if (p.step) setStep(p.step);
    if (typeof p.conditionIndex === "number") {
      setConditionIndex(p.conditionIndex);
    }
    if (p.experimentStartedAt) {
      setExperimentStartedAt(p.experimentStartedAt);
    }
    if (p.patternStartedAt) {
      patternStartedAtRef.current = p.patternStartedAt;
      setPatternStartedAt(p.patternStartedAt);
    }
    if (p.cartAddedView) setCartAddedView(p.cartAddedView);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persist = useCallback(
    (overrides?: Partial<PersistedV1>) => {
      if (!language || !userInfo || !experimentStartedAt) return;
      const base: PersistedV1 = {
        version: 1,
        sessionId,
        language,
        userInfo,
        step,
        conditionIndex,
        experimentStartedAt,
        cartAddedView,
        patternStartedAt: patternStartedAt ?? new Date().toISOString(),
        ...overrides,
      };
      savePersisted(base);
    },
    [
      language,
      userInfo,
      experimentStartedAt,
      sessionId,
      step,
      conditionIndex,
      cartAddedView,
      patternStartedAt,
    ]
  );

  useEffect(() => {
    if (!language || !userInfo || !experimentStartedAt) return;
    persist();
  }, [
    language,
    userInfo,
    step,
    conditionIndex,
    sessionId,
    experimentStartedAt,
    cartAddedView,
    patternStartedAt,
    persist,
  ]);

  const setLanguage = useCallback((l: Language) => {
    const sid = newSessionId();
    setSessionId(sid);
    setLanguageState(l);
    setExperimentStartedAt(new Date().toISOString());
    setStep("userInfo");
  }, []);

  const submitUserInfo = useCallback((u: UserInfo) => {
    setUserInfo(u);
    setStep("bodyType");
  }, []);

  const goProductFromBodyType = useCallback(() => {
    const t = new Date().toISOString();
    patternStartedAtRef.current = t;
    setPatternStartedAt(t);
    setConditionIndex(0);
    setStep("product");
  }, []);

  const currentConditionId = useMemo(
    () => getConditionIdAtIndex(conditionIndex),
    [conditionIndex]
  );

  const useHeightForBodyType = conditionIndex % 2 === 0;

  const viewerCountForPattern = useMemo(
    () => viewerFromSession(sessionId, conditionIndex),
    [sessionId, conditionIndex]
  );

  const socialProofText = useMemo(() => {
    if (!language || !userInfo) return "";
    return getSocialProofText({
      language,
      user: userInfo,
      conditionId: currentConditionId,
      viewerCount: viewerCountForPattern,
      useHeightForBodyType,
    });
  }, [
    language,
    userInfo,
    currentConditionId,
    viewerCountForPattern,
    useHeightForBodyType,
  ]);

  const bumpPatternClock = useCallback(() => {
    const t = new Date().toISOString();
    patternStartedAtRef.current = t;
    setPatternStartedAt(t);
  }, []);

  const completePattern = useCallback(
    async (args: {
      action: PatternAction;
      actionDetail?: string;
      selectedSize: string;
      selectedColor: string;
      quantity: number;
    }) => {
      if (!language || !userInfo || !experimentStartedAt) return;
      const startIso = patternStartedAtRef.current;
      const endedIso = new Date().toISOString();
      const durationMs = Math.max(
        0,
        new Date(endedIso).getTime() - new Date(startIso).getTime()
      );
      const log: PatternLog = {
        sessionId,
        language,
        conditionIndex,
        conditionId: currentConditionId,
        socialProofText,
        userInfo: userInfoForLog(userInfo, language),
        productId: "waffle-henley-shirt",
        action: args.action,
        actionDetail: args.actionDetail,
        startedAt: startIso,
        endedAt: endedIso,
        durationMs,
        durationSec: Math.round(durationMs / 1000),
        selectedSize: args.selectedSize,
        selectedColor: args.selectedColor,
        quantity: args.quantity,
      };
      await logPatternResult(log);
      setSessionPatternLogs((prev) => [...prev, log]);

      if (args.action === "add_to_cart") {
        setCartAddedView("summary");
        setStep("cartAdded");
        return;
      }

      const next = conditionIndex + 1;
      if (next >= CONDITION_ORDER.length) {
        setStep("completed");
        clearPersisted();
        return;
      }
      bumpPatternClock();
      setConditionIndex(next);
    },
    [
      language,
      userInfo,
      experimentStartedAt,
      sessionId,
      conditionIndex,
      currentConditionId,
      socialProofText,
      bumpPatternClock,
    ]
  );

  const advanceAfterCart = useCallback(() => {
    const next = conditionIndex + 1;
    if (next >= CONDITION_ORDER.length) {
      setStep("completed");
      clearPersisted();
      return;
    }
    bumpPatternClock();
    setConditionIndex(next);
    setStep("product");
    setCartAddedView("summary");
  }, [conditionIndex, bumpPatternClock]);

  const resetExperiment = useCallback(() => {
    clearPersisted();
    setLanguageState(null);
    setUserInfo(null);
    setStep("language");
    setConditionIndex(0);
    setSessionId(newSessionId());
    setExperimentStartedAt(null);
    setPatternStartedAt(null);
    setSessionPatternLogs([]);
    setCartAddedView("summary");
  }, []);

  const value: ExperimentContextValue = {
    language,
    setLanguage,
    userInfo,
    setUserInfoDraft: setUserInfo,
    submitUserInfo,
    step,
    goProductFromBodyType,
    conditionIndex,
    totalConditions: CONDITION_ORDER.length,
    currentConditionId,
    socialProofText,
    viewerCountForPattern,
    useHeightForBodyType,
    sessionId,
    experimentStartedAt,
    patternStartedAt,
    sessionPatternLogs,
    cartAddedView,
    setCartAddedView,
    completePattern,
    advanceAfterCart,
    resetExperiment,
  };

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) {
    throw new Error("useExperiment must be within ExperimentProvider");
  }
  return ctx;
}

export { PATTERN_MS };
