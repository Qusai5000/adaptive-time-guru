import React from 'react';
import Layout from '@/components/Layout/Layout';
import { useTimer, TimerSettings } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { BrainCircuit, Volume2, Bell, Mic } from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings } = useTimer();
  
  // Convert settings to minutes for form
  const [focusMinutes, setFocusMinutes] = React.useState(settings.focusDuration / 60);
  const [shortBreakMinutes, setShortBreakMinutes] = React.useState(settings.shortBreakDuration / 60);
  const [longBreakMinutes, setLongBreakMinutes] = React.useState(settings.longBreakDuration / 60);
  const [longBreakInterval, setLongBreakInterval] = React.useState(settings.longBreakInterval);
  const [autoStartBreaks, setAutoStartBreaks] = React.useState(settings.autoStartBreaks);
  const [autoStartPomodoros, setAutoStartPomodoros] = React.useState(settings.autoStartPomodoros);
  const [adaptiveTimers, setAdaptiveTimers] = React.useState(settings.adaptiveTimers);
  const [soundEnabled, setSoundEnabled] = React.useState(settings.soundEnabled);
  const [distractionAlerts, setDistractionAlerts] = React.useState(settings.distractionAlerts);
  const [voiceControlEnabled, setVoiceControlEnabled] = React.useState(settings.voiceControlEnabled);
  
  // Handle save
  const handleSave = () => {
    const newSettings: TimerSettings = {
      focusDuration: focusMinutes * 60,
      shortBreakDuration: shortBreakMinutes * 60,
      longBreakDuration: longBreakMinutes * 60,
      longBreakInterval,
      autoStartBreaks,
      autoStartPomodoros,
      adaptiveTimers,
      soundEnabled,
      distractionAlerts,
      voiceControlEnabled,
    };
    
    updateSettings(newSettings);
    
    toast({
      title: "Settings updated",
      description: "Your timer preferences have been saved.",
    });
  };
  
  // Reset to defaults
  const handleReset = () => {
    setFocusMinutes(25);
    setShortBreakMinutes(5);
    setLongBreakMinutes(15);
    setLongBreakInterval(4);
    setAutoStartBreaks(false);
    setAutoStartPomodoros(false);
    setAdaptiveTimers(true);
    setSoundEnabled(false);
    setDistractionAlerts(true);
    setVoiceControlEnabled(false);
    
    updateSettings({
      focusDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      adaptiveTimers: true,
      soundEnabled: false,
      distractionAlerts: true,
      voiceControlEnabled: false,
    });
    
    toast({
      title: "Settings reset",
      description: "Timer settings have been reset to defaults.",
    });
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your timer preferences
        </p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Timer Duration</CardTitle>
            <CardDescription>
              Set the duration for your focus and break sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="focusDuration"
                  min={1}
                  max={60}
                  step={1}
                  value={[focusMinutes]}
                  onValueChange={(value) => setFocusMinutes(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{focusMinutes}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shortBreakDuration">Short Break Duration (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="shortBreakDuration"
                  min={1}
                  max={30}
                  step={1}
                  value={[shortBreakMinutes]}
                  onValueChange={(value) => setShortBreakMinutes(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{shortBreakMinutes}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longBreakDuration">Long Break Duration (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="longBreakDuration"
                  min={1}
                  max={60}
                  step={1}
                  value={[longBreakMinutes]}
                  onValueChange={(value) => setLongBreakMinutes(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{longBreakMinutes}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longBreakInterval">Long Break Interval (sessions)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="longBreakInterval"
                  min={1}
                  max={8}
                  step={1}
                  value={[longBreakInterval]}
                  onValueChange={(value) => setLongBreakInterval(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{longBreakInterval}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI & Voice Features</CardTitle>
            <CardDescription>
              Settings for AI, voice control, and adaptive features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-purple-600" />
                  <Label htmlFor="adaptiveTimers">Adaptive Timers</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow AI to adjust session durations based on your focus patterns
                </p>
              </div>
              <Switch
                id="adaptiveTimers"
                checked={adaptiveTimers}
                onCheckedChange={setAdaptiveTimers}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-red-500" />
                  <Label htmlFor="voiceControlEnabled">Voice Control</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable hands-free voice commands for timer control
                </p>
              </div>
              <Switch
                id="voiceControlEnabled"
                checked={voiceControlEnabled}
                onCheckedChange={setVoiceControlEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-500" />
                  <Label htmlFor="distractionAlerts">Distraction Alerts</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Show notifications when distractions are detected
                </p>
              </div>
              <Switch
                id="distractionAlerts"
                checked={distractionAlerts}
                onCheckedChange={setDistractionAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="soundEnabled">Background Sounds</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Play focus-enhancing background sounds during sessions
                </p>
              </div>
              <Switch
                id="soundEnabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Behavior</CardTitle>
            <CardDescription>
              Customize how the timer works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start breaks when a focus session ends
                </p>
              </div>
              <Switch
                id="autoStartBreaks"
                checked={autoStartBreaks}
                onCheckedChange={setAutoStartBreaks}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoStartPomodoros">Auto-start Focus Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start a new focus session when a break ends
                </p>
              </div>
              <Switch
                id="autoStartPomodoros"
                checked={autoStartPomodoros}
                onCheckedChange={setAutoStartPomodoros}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
