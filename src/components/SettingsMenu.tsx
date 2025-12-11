import { useState, useEffect } from 'react';
import { Settings, Volume2, VolumeX, Mail, Bug, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface SpeechSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  volume: number;
}

export const SettingsMenu = () => {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved) : 100;
  });
  
  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>(() => {
    const saved = localStorage.getItem('speechSettings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      voice: '',
      rate: 1,
      volume: 1,
    };
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('speechSettings', JSON.stringify(speechSettings));
  }, [speechSettings]);

  const speakText = (text: string) => {
    if (!speechSettings.enabled) return;
    
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (speechSettings.voice) {
      const voice = voices.find(v => v.name === speechSettings.voice);
      if (voice) utterance.voice = voice;
    }
    
    utterance.rate = speechSettings.rate;
    utterance.volume = speechSettings.volume;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (speechSettings.enabled) {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        speakText(mainContent.textContent || '');
      }
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Type className="w-4 h-4" />
            Lettergrootte
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs">A</span>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => setFontSize(value)}
              min={75}
              max={150}
              step={5}
              className="flex-1"
            />
            <span className="text-lg font-bold">A</span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {fontSize}%
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFontSize(100)}
              className="flex-1"
            >
              Normaal
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFontSize(125)}
              className="flex-1"
            >
              Groot
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFontSize(150)}
              className="flex-1"
            >
              Extra Groot
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Volume2 className="w-4 h-4" />
              Voorlezen
            </div>
            <Switch
              checked={speechSettings.enabled}
              onCheckedChange={(enabled) => {
                setSpeechSettings({ ...speechSettings, enabled });
                if (!enabled) stopSpeech();
              }}
            />
          </div>

          {speechSettings.enabled && (
            <div className="space-y-3 pl-6">
              <div className="space-y-2">
                <Label className="text-xs">Stem</Label>
                <Select
                  value={speechSettings.voice}
                  onValueChange={(voice) => setSpeechSettings({ ...speechSettings, voice })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecteer stem..." />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name} className="text-xs">
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Snelheid: {speechSettings.rate.toFixed(1)}x</Label>
                <Slider
                  value={[speechSettings.rate]}
                  onValueChange={([rate]) => setSpeechSettings({ ...speechSettings, rate })}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Volume: {Math.round(speechSettings.volume * 100)}%</Label>
                <Slider
                  value={[speechSettings.volume]}
                  onValueChange={([volume]) => setSpeechSettings({ ...speechSettings, volume })}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>

              <Button 
                onClick={toggleSpeech} 
                size="sm" 
                className="w-full"
                variant={isSpeaking ? "destructive" : "default"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Stop Voorlezen
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Pagina Voorlezen
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="w-4 h-4" />
            Contact
          </div>
          <p className="text-xs text-muted-foreground">
            Neem contact op via: <a href="mailto:info@ajos.nl" className="text-primary hover:underline">info@ajos.nl</a>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bug className="w-4 h-4" />
            Bug Melden
          </div>
          <p className="text-xs text-muted-foreground">
            Meld problemen via: <a href="mailto:bugs@ajos.nl" className="text-primary hover:underline">bugs@ajos.nl</a>
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
