import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type ReadingMode = 'sentence' | 'word';

interface SpeechSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  volume: number;
  readingMode: ReadingMode;
}

interface SpeechContextType {
  settings: SpeechSettings;
  updateSettings: (settings: Partial<SpeechSettings>) => void;
  voices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
  isPaused: boolean;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  speakElement: (element: HTMLElement) => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (open: boolean) => void;
}

const defaultSettings: SpeechSettings = {
  enabled: false,
  voice: '',
  rate: 1,
  volume: 1,
  readingMode: 'sentence',
};

const SpeechContext = createContext<SpeechContextType | null>(null);

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
};

export const SpeechProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SpeechSettings>(() => {
    const saved = localStorage.getItem('speechSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const dutchVoices = availableVoices.filter(v => 
        v.lang.startsWith('nl') || v.lang.startsWith('en')
      );
      setVoices(dutchVoices.length > 0 ? dutchVoices : availableVoices.slice(0, 10));
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('speechSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const speak = useCallback((text: string) => {
    if (!settings.enabled || !text) return;

    speechSynthesis.cancel();

    const segments = settings.readingMode === 'word' 
      ? text.split(/\s+/).filter(Boolean)
      : text.split(/[.!?]+/).filter(Boolean).map(s => s.trim());

    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= segments.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(segments[currentIndex]);
      
      if (settings.voice) {
        const voice = voices.find(v => v.name === settings.voice);
        if (voice) utterance.voice = voice;
      }

      utterance.rate = settings.rate;
      utterance.volume = settings.volume;

      utterance.onend = () => {
        currentIndex++;
        speakNext();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    };

    setIsSpeaking(true);
    setIsPaused(false);
    speakNext();
  }, [settings, voices]);

  const pause = useCallback(() => {
    speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const speakElement = useCallback((element: HTMLElement) => {
    const text = element.textContent || element.innerText;
    speak(text);
  }, [speak]);

  return (
    <SpeechContext.Provider value={{
      settings,
      updateSettings,
      voices,
      isSpeaking,
      isPaused,
      speak,
      pause,
      resume,
      stop,
      speakElement,
      isControlsOpen,
      setIsControlsOpen,
    }}>
      {children}
    </SpeechContext.Provider>
  );
};
