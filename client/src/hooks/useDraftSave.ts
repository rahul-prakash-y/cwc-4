import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export interface DraftPayload {
  codeResponse?: string;
  githubUrl?: string;
  fileUrl?: string;
  notes?: string;
  taskId: string;
}

export function useDraftSave(taskId: string, initialDraft: Partial<DraftPayload> = {}) {
  const { apiFetch } = useAuth();
  const [draft, setDraft] = useState<DraftPayload>(() => {
    try {
      const saved = localStorage.getItem(`cwc_draft_task_${taskId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading draft from localStorage', e);
    }
    return {
      taskId,
      codeResponse: initialDraft.codeResponse || '',
      githubUrl: initialDraft.githubUrl || '',
      fileUrl: initialDraft.fileUrl || '',
      notes: initialDraft.notes || '',
    };
  });

  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Auto-save to localStorage whenever draft changes
  useEffect(() => {
    try {
      localStorage.setItem(`cwc_draft_task_${taskId}`, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
  }, [taskId, draft]);

  // Periodic draft saving to backend API every 30s
  useEffect(() => {
    const saveDraftToBackend = async () => {
      const currentDraft = draftRef.current;
      if (!currentDraft.codeResponse && !currentDraft.githubUrl && !currentDraft.fileUrl && !currentDraft.notes) {
        return;
      }
      setIsSaving(true);
      try {
        await apiFetch(`/student/tasks/${taskId}/draft`, {
          method: 'POST',
          body: JSON.stringify(currentDraft),
        });
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedTime(now);
      } catch (err) {
        console.warn('Backend draft save failed, saved locally:', err);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedTime(`${now} (Local)`);
      } finally {
        setIsSaving(false);
      }
    };

    const interval = setInterval(saveDraftToBackend, 30000);
    return () => clearInterval(interval);
  }, [taskId, apiFetch]);

  const updateDraft = (fields: Partial<DraftPayload>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
  };

  const clearDraft = () => {
    localStorage.removeItem(`cwc_draft_task_${taskId}`);
    setDraft({
      taskId,
      codeResponse: '',
      githubUrl: '',
      fileUrl: '',
      notes: '',
    });
  };

  return {
    draft,
    updateDraft,
    clearDraft,
    lastSavedTime,
    isSaving,
  };
}
