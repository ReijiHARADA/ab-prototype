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

import {
  getConditionIdAtIndexInOrder,
  isSequencePatternId,
  SEQUENCE_PATTERN_ORDERS,
} from "@/lib/experiment";
import { getMessages } from "@/lib/i18n";
import { buildParticipantSessionLog } from "@/lib/participantLog";
import { logParticipantSession } from "@/lib/logger";
import {
  getSocialProofSegments,
  getSocialProofText,
} from "@/lib/socialProofText";
import type { SocialProofSegment } from "@/lib/socialProofText";
import type {
  AppStep,
  ConditionId,
  Language,
  PatternAction,
  PatternLog,
  SequencePatternId,
  UserInfo,
} from "@/types/experiment";

const STORAGE_KEY = "ab-experiment-state-v4";

interface PersistedV1 {
  version: 1;
  sessionId: string;
  language: Language;
  experimentStartedAt: string;
  sequencePattern: SequencePatternId | null;
  userInfo: UserInfo | null;
  step: AppStep;
  conditionIndex: number;
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
  /** 言語選択後に選ぶ a/b/c の順序（1〜6） */
  sequencePattern: SequencePatternId | null;
  submitSequencePattern: (id: SequencePatternId) => void;
  /** 現在のセッションで使う条件の並び（3件） */
  conditionOrder: readonly ConditionId[];
  userInfo: UserInfo | null;
  setUserInfoDraft: (u: UserInfo) => void;
  submitUserInfo: (u: UserInfo) => void;
  step: AppStep;
  /** 戻る後の中間画面 → 次パターンの商品（ソーシャルプルーフ）へ */
  advanceFromSurveyPrompt: () => void;
  goProductFromBodyType: () => void;
  conditionIndex: number;
  totalConditions: number;
  currentConditionId: ConditionId;
  socialProofText: string;
  socialProofSegments: SocialProofSegment[];
  sessionId: string;
  experimentStartedAt: string | null;
  patternStartedAt: string | null;
  sessionPatternLogs: PatternLog[];
  /** パターン離脱（timeout/back/add_to_cart のうちログに残す直前まで） */
  completePattern: (args: {
    action: PatternAction;
    actionDetail?: string;
    selectedSize: string;
    selectedColor: string;
    quantity: number;
  }) => void;
  resetExperiment: () => void;
}

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

const PATTERN_MS = 120_000;

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language | null>(null);
  const [sequencePattern, setSequencePattern] =
    useState<SequencePatternId | null>(null);
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
  const sessionPatternLogsRef = useRef<PatternLog[]>([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    sessionPatternLogsRef.current = sessionPatternLogs;
  }, [sessionPatternLogs]);

  /* localStorage から実験の再開用に復元（クライアント専用） */
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const p = loadPersisted();
    if (!p?.sessionId) return;
    /* eslint-disable react-hooks/set-state-in-effect -- マウント時の一度限りの復元 */
    setSessionId(p.sessionId);
    if (p.language) setLanguageState(p.language);
    if (p.sequencePattern != null && isSequencePatternId(p.sequencePattern)) {
      setSequencePattern(p.sequencePattern);
    }
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
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persist = useCallback(
    (overrides?: Partial<PersistedV1>) => {
      if (!language || !experimentStartedAt) return;
      const base: PersistedV1 = {
        version: 1,
        sessionId,
        language,
        experimentStartedAt,
        sequencePattern,
        userInfo,
        step,
        conditionIndex,
        patternStartedAt: patternStartedAt ?? new Date().toISOString(),
        ...overrides,
      };
      savePersisted(base);
    },
    [
      language,
      sequencePattern,
      userInfo,
      experimentStartedAt,
      sessionId,
      step,
      conditionIndex,
      patternStartedAt,
    ]
  );

  useEffect(() => {
    if (!language || !experimentStartedAt) return;
    persist();
  }, [
    language,
    sequencePattern,
    userInfo,
    step,
    conditionIndex,
    sessionId,
    experimentStartedAt,
    patternStartedAt,
    persist,
  ]);

  const setLanguage = useCallback((l: Language) => {
    const sid = newSessionId();
    setSessionId(sid);
    setLanguageState(l);
    setSequencePattern(null);
    setUserInfo(null);
    setExperimentStartedAt(new Date().toISOString());
    setStep("patternSelect");
  }, []);

  const submitSequencePattern = useCallback((id: SequencePatternId) => {
    setSequencePattern(id);
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

  const conditionOrder = useMemo((): readonly ConditionId[] => {
    if (sequencePattern == null) return SEQUENCE_PATTERN_ORDERS[1];
    return SEQUENCE_PATTERN_ORDERS[sequencePattern];
  }, [sequencePattern]);

  const currentConditionId = useMemo(
    () => getConditionIdAtIndexInOrder(conditionOrder, conditionIndex),
    [conditionOrder, conditionIndex]
  );

  const socialProofCtx = useMemo(
    () =>
      language && userInfo
        ? {
            language,
            user: userInfo,
            conditionId: currentConditionId,
          }
        : null,
    [language, userInfo, currentConditionId]
  );

  const socialProofSegments = useMemo(
    () => (socialProofCtx ? getSocialProofSegments(socialProofCtx) : []),
    [socialProofCtx]
  );

  const socialProofText = useMemo(
    () => (socialProofCtx ? getSocialProofText(socialProofCtx) : ""),
    [socialProofCtx]
  );

  const bumpPatternClock = useCallback(() => {
    const t = new Date().toISOString();
    patternStartedAtRef.current = t;
    setPatternStartedAt(t);
  }, []);

  const advanceFromSurveyPrompt = useCallback(() => {
    const order =
      sequencePattern != null
        ? SEQUENCE_PATTERN_ORDERS[sequencePattern]
        : SEQUENCE_PATTERN_ORDERS[1];
    const next = conditionIndex + 1;
    if (next >= order.length) {
      const row = buildParticipantSessionLog(
        sessionPatternLogsRef.current,
        experimentStartedAt
      );
      if (row) void logParticipantSession(row);
      setStep("completed");
      clearPersisted();
      return;
    }
    bumpPatternClock();
    setConditionIndex(next);
    setStep("product");
  }, [conditionIndex, sequencePattern, bumpPatternClock, experimentStartedAt]);

  const completePattern = useCallback(
    (args: {
      action: PatternAction;
      actionDetail?: string;
      selectedSize: string;
      selectedColor: string;
      quantity: number;
    }) => {
      if (!language || !userInfo || !experimentStartedAt) return;
      if (sequencePattern == null) return;
      const startIso = patternStartedAtRef.current;
      const endedIso = new Date().toISOString();
      const durationMs = Math.max(
        0,
        new Date(endedIso).getTime() - new Date(startIso).getTime()
      );
      const log: PatternLog = {
        sessionId,
        language,
        sequencePattern,
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
      setSessionPatternLogs((prev) => [...prev, log]);

      if (
        args.action === "add_to_cart" ||
        args.action === "back" ||
        args.action === "timeout"
      ) {
        setStep("surveyPrompt");
        return;
      }
    },
    [
      language,
      userInfo,
      experimentStartedAt,
      sessionId,
      conditionIndex,
      currentConditionId,
      socialProofText,
      sequencePattern,
    ]
  );

  const resetExperiment = useCallback(() => {
    clearPersisted();
    setLanguageState(null);
    setSequencePattern(null);
    setUserInfo(null);
    setStep("language");
    setConditionIndex(0);
    setSessionId(newSessionId());
    setExperimentStartedAt(null);
    setPatternStartedAt(null);
    setSessionPatternLogs([]);
  }, []);

  const value: ExperimentContextValue = {
    language,
    setLanguage,
    sequencePattern,
    submitSequencePattern,
    conditionOrder,
    userInfo,
    setUserInfoDraft: setUserInfo,
    submitUserInfo,
    step,
    advanceFromSurveyPrompt,
    goProductFromBodyType,
    conditionIndex,
    totalConditions: conditionOrder.length,
    currentConditionId,
    socialProofText,
    socialProofSegments,
    sessionId,
    experimentStartedAt,
    patternStartedAt,
    sessionPatternLogs,
    completePattern,
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
