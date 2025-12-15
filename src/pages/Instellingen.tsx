import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mail, Bug, Type, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Separator } from '@/components/ui/separator';

interface SpeechSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  volume: number;
}

const Instellingen = () => {
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar home
            </Link>
            <h1 className="text-3xl font-bold">Instellingen</h1>
            <p className="text-muted-foreground mt-2">Pas de website aan naar jouw voorkeuren</p>
          </div>

          <div className="space-y-6">
            {/* Lettergrootte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Lettergrootte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm">A</span>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                    min={75}
                    max={150}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xl font-bold">A</span>
                </div>
                <div className="text-center text-lg font-medium">
                  {fontSize}%
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant={fontSize === 100 ? "default" : "outline"}
                    onClick={() => setFontSize(100)}
                    className="flex-1"
                  >
                    Normaal
                  </Button>
                  <Button 
                    variant={fontSize === 125 ? "default" : "outline"}
                    onClick={() => setFontSize(125)}
                    className="flex-1"
                  >
                    Groot
                  </Button>
                  <Button 
                    variant={fontSize === 150 ? "default" : "outline"}
                    onClick={() => setFontSize(150)}
                    className="flex-1"
                  >
                    Extra Groot
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Voorlezen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Voorlezen
                  </div>
                  <Switch
                    checked={speechSettings.enabled}
                    onCheckedChange={(enabled) => {
                      setSpeechSettings({ ...speechSettings, enabled });
                      if (!enabled) stopSpeech();
                    }}
                  />
                </CardTitle>
              </CardHeader>
              {speechSettings.enabled && (
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Stem</Label>
                    <Select
                      value={speechSettings.voice}
                      onValueChange={(voice) => setSpeechSettings({ ...speechSettings, voice })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer een stem..." />
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

                  <div className="space-y-2">
                    <Label>Snelheid: {speechSettings.rate.toFixed(1)}x</Label>
                    <Slider
                      value={[speechSettings.rate]}
                      onValueChange={([rate]) => setSpeechSettings({ ...speechSettings, rate })}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Volume: {Math.round(speechSettings.volume * 100)}%</Label>
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
                </CardContent>
              )}
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Heb je vragen of opmerkingen? Neem contact op via:{' '}
                  <a href="mailto:info@ajos.nl" className="text-primary hover:underline font-medium">
                    info@ajos.nl
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Bug Melden */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Bug Melden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Werkt er iets niet goed? Meld het via:{' '}
                  <a href="mailto:bugs@ajos.nl" className="text-primary hover:underline font-medium">
                    bugs@ajos.nl
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Instellingen;
