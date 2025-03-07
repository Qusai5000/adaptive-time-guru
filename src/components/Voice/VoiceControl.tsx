
import React, { useState, useEffect, useCallback } from 'react';
import { useTimer } from '@/context/TimerContext';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const VoiceControl: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMicSupported, setIsMicSupported] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<any>(null);
  
  const { 
    mode, 
    status, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    skipTimer, 
    setMode,
    settings,
    updateSettings
  } = useTimer();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use the appropriate Speech Recognition constructor with TypeScript support
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');
          
          setTranscript(transcript);
          processCommand(transcript.toLowerCase());
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          
          toast({
            title: "Voice control error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        };
        
        setRecognition(recognitionInstance);
      } else {
        setIsMicSupported(false);
        
        toast({
          title: "Voice control not supported",
          description: "Your browser doesn't support voice control. Try using Chrome for the best experience.",
          variant: "destructive",
        });
      }
    }
    
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (error) {
          console.error('Error stopping recognition', error);
        }
      }
    };
  }, []);
  
  // Process voice commands
  const processCommand = useCallback((command: string) => {
    // Simple command processing
    if (command.includes('start') || command.includes('begin') || command.includes('go')) {
      startTimer();
      toast({
        title: "Voice command detected",
        description: "Starting timer",
      });
    } else if (command.includes('pause') || command.includes('stop')) {
      pauseTimer();
      toast({
        title: "Voice command detected",
        description: "Pausing timer",
      });
    } else if (command.includes('reset')) {
      resetTimer();
      toast({
        title: "Voice command detected",
        description: "Resetting timer",
      });
    } else if (command.includes('skip')) {
      skipTimer();
      toast({
        title: "Voice command detected",
        description: "Skipping to next timer",
      });
    } else if (command.includes('focus') || command.includes('work')) {
      setMode('focus');
      toast({
        title: "Voice command detected",
        description: "Switching to focus mode",
      });
    } else if (command.includes('short break')) {
      setMode('shortBreak');
      toast({
        title: "Voice command detected",
        description: "Switching to short break",
      });
    } else if (command.includes('long break')) {
      setMode('longBreak');
      toast({
        title: "Voice command detected",
        description: "Switching to long break",
      });
    } else if (command.includes('turn on sound') || command.includes('enable sound')) {
      updateSettings({ soundEnabled: true });
      toast({
        title: "Voice command detected",
        description: "Sound enabled",
      });
    } else if (command.includes('turn off sound') || command.includes('disable sound')) {
      updateSettings({ soundEnabled: false });
      toast({
        title: "Voice command detected",
        description: "Sound disabled",
      });
    } else if (command.includes('play sound') || command.includes('start sound')) {
      // We'll handle this command in the SoundControls component
      window.dispatchEvent(new CustomEvent('play-sound'));
      toast({
        title: "Voice command detected",
        description: "Playing sound",
      });
    } else if (command.includes('stop sound') || command.includes('pause sound')) {
      // We'll handle this command in the SoundControls component
      window.dispatchEvent(new CustomEvent('pause-sound'));
      toast({
        title: "Voice command detected",
        description: "Pausing sound",
      });
    }
  }, [startTimer, pauseTimer, resetTimer, skipTimer, setMode, updateSettings]);
  
  // Toggle listening
  const toggleListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
        toast({
          title: "Voice control disabled",
          description: "No longer listening for commands",
        });
      } else {
        recognition.start();
        setIsListening(true);
        toast({
          title: "Voice control enabled",
          description: "Listening for commands like 'start timer', 'pause', 'reset', 'skip', 'focus mode', 'short break'...",
        });
      }
    } catch (error) {
      console.error('Error toggling recognition', error);
      setIsListening(false);
    }
  }, [isListening, recognition]);
  
  if (!isMicSupported) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="gap-2 text-muted-foreground"
        disabled={true}
      >
        <MicOff className="h-4 w-4" />
        <span>Voice Control Unsupported</span>
      </Button>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      className={cn(
        "gap-2",
        isListening ? "bg-red-50 border-red-200 text-red-600" : ""
      )}
      onClick={toggleListening}
    >
      {isListening ? (
        <>
          <Mic className="h-4 w-4 animate-pulse text-red-600" />
          <span>Listening...</span>
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          <span>Voice Control</span>
        </>
      )}
    </Button>
  );
};

export default VoiceControl;
