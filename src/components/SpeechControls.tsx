import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Settings2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpeech } from '@/contexts/SpeechContext';
import { cn } from '@/lib/utils';

// Helper to find the closest text-containing element
const findTextElement = (element: HTMLElement): HTMLElement | null => {
  // Skip if it's part of the speech controls
  if (element.closest('[data-speech-controls]')) return null;
  
  // Skip buttons, inputs, and interactive elements
  const tagName = element.tagName.toLowerCase();
  if (['button', 'input', 'select', 'textarea', 'a'].includes(tagName)) return null;
  
  // Check if element has direct text content
  const hasDirectText = Array.from(element.childNodes).some(
    node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
  );
  
  if (hasDirectText) {
    return element;
  }
  
  // Check for text in specific text elements
  if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'li', 'td', 'th', 'label', 'div'].includes(tagName)) {
    const text = element.textContent?.trim();
    if (text && text.length > 0) {
      return element;
    }
  }
  
  return null;
};

export const SpeechControls = () => {
  const {
    settings,
    updateSettings,
    voices,
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    isControlsOpen,
    setIsControlsOpen,
  } = useSpeech();

  const [isListening, setIsListening] = useState(false);

  // Handle click-to-read functionality
  useEffect(() => {
    if (!settings.enabled || !isListening) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignore clicks on controls
      if (target.closest('[data-speech-controls]')) return;
      
      const textElement = findTextElement(target);
      if (textElement) {
        const text = textElement.textContent?.trim();
        if (text) {
          e.preventDefault();
          e.stopPropagation();
          speak(text, textElement);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [settings.enabled, isListening, speak]);

  // Add visual indicator for clickable text elements when listening
  useEffect(() => {
    if (!settings.enabled || !isListening) return;

    const style = document.createElement('style');
    style.id = 'speech-hover-style';
    style.textContent = `
      p:hover, h1:hover, h2:hover, h3:hover, h4:hover, h5:hover, h6:hover,
      span:hover, li:hover, td:hover, th:hover, label:hover {
        background-color: hsl(217 91% 60% / 0.1) !important;
        cursor: pointer !important;
        border-radius: 4px;
      }
      [data-speech-controls], [data-speech-controls] * {
        background-color: transparent !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('speech-hover-style');
      if (existingStyle) existingStyle.remove();
    };
  }, [settings.enabled, isListening]);

  if (!settings.enabled) return null;

  const handleMainButtonClick = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      setIsListening(!isListening);
    }
  };

  const handleReadPage = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      speak(mainContent.textContent || '', mainContent as HTMLElement);
    }
  };

  const handleStop = () => {
    stop();
    setIsListening(false);
  };

  return (
    <div 
      data-speech-controls
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      {/* Controls Panel */}
      {isControlsOpen && (
        <div className="bg-card border border-border rounded-2xl shadow-xl p-4 w-80 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Spraakbediening
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsControlsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Stem</Label>
              <Select
                value={settings.voice}
                onValueChange={(voice) => updateSettings({ voice })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecteer stem..." />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <Label className="text-sm">Snelheid: {settings.rate.toFixed(1)}x</Label>
              <Slider
                value={[settings.rate]}
                onValueChange={([rate]) => updateSettings({ rate })}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label className="text-sm">Volume: {Math.round(settings.volume * 100)}%</Label>
              <Slider
                value={[settings.volume]}
                onValueChange={([volume]) => updateSettings({ volume })}
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            {/* Reading Mode */}
            <div className="space-y-2">
              <Label className="text-sm">Voorlezen per</Label>
              <div className="flex gap-2">
                <Button
                  variant={settings.readingMode === 'sentence' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateSettings({ readingMode: 'sentence' })}
                >
                  Zin
                </Button>
                <Button
                  variant={settings.readingMode === 'word' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateSettings({ readingMode: 'word' })}
                >
                  Woord
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleReadPage}
                size="sm"
                className="flex-1"
                disabled={isSpeaking}
              >
                <Play className="w-4 h-4 mr-2" />
                Lees pagina
              </Button>
              {isSpeaking && (
                <Button
                  onClick={handleStop}
                  size="sm"
                  variant="destructive"
                >
                  <Square className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button Group */}
      <div className="flex items-center gap-2">
        {/* Settings Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-card"
          onClick={() => setIsControlsOpen(!isControlsOpen)}
        >
          <Settings2 className="w-5 h-5" />
        </Button>

        {/* Main Sound Button */}
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all",
            isListening && !isSpeaking && "bg-primary animate-pulse",
            isSpeaking && "bg-accent"
          )}
          onClick={handleMainButtonClick}
        >
          {isSpeaking ? (
            isPaused ? (
              <Play className="w-6 h-6" />
            ) : (
              <Pause className="w-6 h-6" />
            )
          ) : isListening ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Status indicator */}
      {isListening && !isSpeaking && (
        <p className="text-sm text-muted-foreground bg-card/90 px-3 py-1 rounded-full shadow border">
          Klik op tekst om voor te lezen
        </p>
      )}
    </div>
  );
};
