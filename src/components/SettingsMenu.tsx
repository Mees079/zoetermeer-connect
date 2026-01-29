import { useState, useEffect } from 'react';
import { Settings, Volume2, Mail, Bug, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useSpeech } from '@/contexts/SpeechContext';

export const SettingsMenu = () => {
  const { settings: speechSettings, updateSettings } = useSpeech();
  
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved) : 100;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

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
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>
          {speechSettings.enabled && (
            <p className="text-xs text-muted-foreground pl-6">
              Gebruik de zwevende knop rechtsonder om tekst voor te lezen.
            </p>
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
