import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';

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
  currentWord: string;
  currentWordIndex: number;
  speak: (text: string, element?: HTMLElement) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
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
  const [currentWord, setCurrentWord] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  
  const highlightRef = useRef<HTMLElement | null>(null);
  const originalContentRef = useRef<string>('');

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

  const cleanupHighlight = useCallback(() => {
    if (highlightRef.current && originalContentRef.current) {
      highlightRef.current.innerHTML = originalContentRef.current;
      highlightRef.current = null;
      originalContentRef.current = '';
    }
    setCurrentWord('');
    setCurrentWordIndex(-1);
  }, []);

  const speak = useCallback((text: string, element?: HTMLElement) => {
    if (!settings.enabled || !text) return;

    speechSynthesis.cancel();
    cleanupHighlight();

    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const words = cleanText.split(' ').filter(Boolean);
    
    // Store element for highlighting
    if (element) {
      highlightRef.current = element;
      originalContentRef.current = element.innerHTML;
    }

    if (settings.readingMode === 'word') {
      // Read word by word with highlighting
      let wordIndex = 0;

      const speakNextWord = () => {
        if (wordIndex >= words.length) {
          setIsSpeaking(false);
          cleanupHighlight();
          return;
        }

        const word = words[wordIndex];
        setCurrentWord(word);
        setCurrentWordIndex(wordIndex);

        // Update highlight in element
        if (highlightRef.current && originalContentRef.current) {
          const highlightedHTML = words.map((w, i) => {
            if (i === wordIndex) {
              return `<span style="text-decoration: underline; text-decoration-color: hsl(217, 91%, 60%); text-decoration-thickness: 3px; text-underline-offset: 4px;">${w}</span>`;
            }
            return w;
          }).join(' ');
          highlightRef.current.innerHTML = highlightedHTML;
        }

        const utterance = new SpeechSynthesisUtterance(word);
        
        if (settings.voice) {
          const voice = voices.find(v => v.name === settings.voice);
          if (voice) utterance.voice = voice;
        }

        utterance.rate = settings.rate;
        utterance.volume = settings.volume;

        utterance.onend = () => {
          wordIndex++;
          speakNextWord();
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          cleanupHighlight();
        };

        speechSynthesis.speak(utterance);
      };

      setIsSpeaking(true);
      setIsPaused(false);
      speakNextWord();
    } else {
      // Read sentence by sentence
      const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim());
      let sentenceIndex = 0;

      const speakNextSentence = () => {
        if (sentenceIndex >= sentences.length) {
          setIsSpeaking(false);
          cleanupHighlight();
          return;
        }

        const sentence = sentences[sentenceIndex].trim();
        const sentenceWords = sentence.split(' ').filter(Boolean);
        
        const utterance = new SpeechSynthesisUtterance(sentence);
        
        if (settings.voice) {
          const voice = voices.find(v => v.name === settings.voice);
          if (voice) utterance.voice = voice;
        }

        utterance.rate = settings.rate;
        utterance.volume = settings.volume;

        // Track word boundaries for highlighting
        utterance.onboundary = (event) => {
          if (event.name === 'word' && highlightRef.current) {
            const charIndex = event.charIndex;
            let wordCount = 0;
            let currentPos = 0;
            
            for (const word of sentenceWords) {
              if (currentPos >= charIndex && currentPos < charIndex + word.length + 1) {
                setCurrentWord(word);
                setCurrentWordIndex(wordCount);
                
                // Update highlight
                const highlightedHTML = sentenceWords.map((w, i) => {
                  if (i === wordCount) {
                    return `<span style="text-decoration: underline; text-decoration-color: hsl(217, 91%, 60%); text-decoration-thickness: 3px; text-underline-offset: 4px;">${w}</span>`;
                  }
                  return w;
                }).join(' ');
                highlightRef.current!.innerHTML = highlightedHTML;
                break;
              }
              currentPos += word.length + 1;
              wordCount++;
            }
          }
        };

        utterance.onend = () => {
          sentenceIndex++;
          speakNextSentence();
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          cleanupHighlight();
        };

        speechSynthesis.speak(utterance);
      };

      setIsSpeaking(true);
      setIsPaused(false);
      speakNextSentence();
    }
  }, [settings, voices, cleanupHighlight]);

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
    cleanupHighlight();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [cleanupHighlight]);

  return (
    <SpeechContext.Provider value={{
      settings,
      updateSettings,
      voices,
      isSpeaking,
      isPaused,
      currentWord,
      currentWordIndex,
      speak,
      pause,
      resume,
      stop,
      isControlsOpen,
      setIsControlsOpen,
    }}>
      {children}
    </SpeechContext.Provider>
  );
};
