import { useCallback, useEffect, useRef, useState } from "react";

interface UseSessionTimeoutOptions {
  timeoutMs: number;
  warningMs?: number;
  onTimeout: () => void;
  enabled?: boolean;
}

interface UseSessionTimeoutReturn {
  warningVisible: boolean;
  resetTimer: () => void;
  cancelTimeout: () => void;
  remainingSeconds: number;
  extend: () => void;
}

const EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "visibilitychange"];

/**
 * Hook que detecta inactividad y avisa al usuario antes de cerrar el flujo.
 *
 *  - Tras `timeoutMs` sin interacción, se dispara `onTimeout` (cancelación del proceso).
 *  - Si `warningMs` está definido, antes del timeout se muestra una advertencia
 *    con un countdown de `warningMs`. Si el usuario extiende, el contador se resetea.
 *
 * El hook escucha los eventos globales; no hace falta pasar referencias al DOM.
 */
export const useSessionTimeout = ({
  timeoutMs,
  warningMs = 30000,
  onTimeout,
  enabled = true,
}: UseSessionTimeoutOptions): UseSessionTimeoutReturn => {
  const [warningVisible, setWarningVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.ceil(warningMs / 1000),
  );

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const clearAll = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current !== null) {
      clearInterval(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (!enabled || cancelledRef.current) return;
    clearAll();
    setWarningVisible(false);
    setRemainingSeconds(Math.ceil(warningMs / 1000));

    const msBeforeWarning = Math.max(timeoutMs - warningMs, 1000);

    timeoutRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      setWarningVisible(true);

      const startedAt = Date.now();
      warningRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, Math.ceil(warningMs / 1000) - Math.floor(elapsed / 1000));
        setRemainingSeconds(remaining);
        if (remaining <= 0) {
          clearAll();
          onTimeout();
        }
      }, 250);
    }, msBeforeWarning);
  }, [timeoutMs, warningMs, onTimeout, enabled, clearAll]);

  const extend = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const cancelTimeout = useCallback(() => {
    cancelledRef.current = true;
    clearAll();
    setWarningVisible(false);
  }, [clearAll]);

  useEffect(() => {
    if (!enabled) {
      clearAll();
      return;
    }
    cancelledRef.current = false;
    resetTimer();

    const handler = () => {
      if (!warningVisible) {
        resetTimer();
      }
    };

    for (const ev of EVENTS) {
      window.addEventListener(ev, handler, { passive: true });
    }

    return () => {
      for (const ev of EVENTS) {
        window.removeEventListener(ev, handler);
      }
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, resetTimer]);

  return {
    warningVisible,
    resetTimer,
    cancelTimeout,
    remainingSeconds,
    extend,
  };
};