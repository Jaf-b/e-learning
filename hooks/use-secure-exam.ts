"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UseSecureExamOptions {
  /** Durée en secondes avant soumission automatique (défaut: 15) */
  warningDurationSeconds?: number;
  /** Appelé lorsque le compte à rebours se termine — doit déclencher la soumission */
  onAutoSubmit: () => void;
  /** Si false, le mode sécurisé est désactivé (ex: exam déjà soumis) */
  enabled: boolean;
}

interface UseSecureExamReturn {
  /** true si l'étudiant a quitté l'onglet et que le compte à rebours est actif */
  isWarningVisible: boolean;
  /** Secondes restantes avant soumission automatique */
  countdown: number;
  /** Nombre de fois où l'étudiant a changé d'onglet */
  tabSwitchCount: number;
  /** Permet à l'étudiant de revenir et d'annuler le countdown (optionnel) */
  onReturnToTab: () => void;
}

export function useSecureExam({
  warningDurationSeconds = 15,
  onAutoSubmit,
  enabled,
}: UseSecureExamOptions): UseSecureExamReturn {
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [countdown, setCountdown] = useState(warningDurationSeconds);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmitRef = useRef(onAutoSubmit);

  // Garder la référence à jour sans re-créer les effets
  useEffect(() => {
    autoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  const clearCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    clearCountdown();
    setCountdown(warningDurationSeconds);
    setIsWarningVisible(true);

    let remaining = warningDurationSeconds;

    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        clearCountdown();
        setIsWarningVisible(false);
        autoSubmitRef.current();
      }
    }, 1000);
  }, [warningDurationSeconds, clearCountdown]);

  const onReturnToTab = useCallback(() => {
    // L'étudiant revient sur l'onglet — on annule le countdown
    // mais on garde le warning visible pour l'informer qu'une violation a été enregistrée
    clearCountdown();
    setIsWarningVisible(false);
    setCountdown(warningDurationSeconds);
  }, [clearCountdown, warningDurationSeconds]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // L'étudiant a quitté l'onglet
        setTabSwitchCount((prev) => prev + 1);
        startCountdown();
      } else {
        // L'étudiant est revenu — on annule le countdown automatiquement
        onReturnToTab();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearCountdown();
    };
  }, [enabled, startCountdown, onReturnToTab, clearCountdown]);

  return {
    isWarningVisible,
    countdown,
    tabSwitchCount,
    onReturnToTab,
  };
}
