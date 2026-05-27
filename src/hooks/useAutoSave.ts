import { useEffect, useRef, useState } from 'react';
import { useCollageState } from './useCollageState';
import { useCollageSync } from './useCollageSync';

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveReturn {
  readonly status: AutoSaveStatus;
  readonly lastSaved: Date | null;
}

const DEBOUNCE_MS = 5_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

/**
 * Watches Zustand collage state for changes and debounce-saves to Supabase
 * after 5 seconds of inactivity. Shows status for a subtle UI indicator.
 *
 * Usage: call at the top of the editor screen.
 *   const { status, lastSaved } = useAutoSave();
 */
export function useAutoSave(): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const { save } = useCollageSync();

  useEffect(() => {
    // Subscribe to every Zustand state change.
    // We only care about "saveable" fields, not selection state.
    const unsubscribe = useCollageState.subscribe(
      (current, previous) => {
        // Skip if only selection changed
        const saveable = (s: typeof current) => ({
          type: s.type,
          aspectRatio: s.aspectRatio,
          backgroundColor: s.backgroundColor,
          photos: s.photos,
          stickers: s.stickers,
          textOverlays: s.textOverlays,
          templateId: s.templateId,
          eventId: s.eventId,
        });

        const curr = saveable(current);
        const prev = saveable(previous);

        // Shallow comparison of serialized values as a fast check
        if (JSON.stringify(curr) === JSON.stringify(prev)) {
          return;
        }

        // Clear existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Reset retry counter on new changes
        retryCountRef.current = 0;

        // Schedule save
        timerRef.current = setTimeout(() => {
          void performSave();
        }, DEBOUNCE_MS);
      },
    );

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function performSave(): Promise<void> {
    setStatus('saving');

    const result = await save();

    if (result.error) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        timerRef.current = setTimeout(() => {
          void performSave();
        }, RETRY_DELAY_MS * retryCountRef.current);
        return;
      }
      setStatus('error');
      return;
    }

    retryCountRef.current = 0;
    setLastSaved(new Date());
    setStatus('saved');

    // Reset to idle after 2 seconds
    setTimeout(() => {
      setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
    }, 2_000);
  }

  return { status, lastSaved };
}
