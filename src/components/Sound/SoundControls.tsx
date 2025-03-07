import React, { useState, useEffect, useRef } from 'react';
import { useTimer } from '@/context/TimerContext';
import { Volume2, VolumeX, Headphones, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export interface SoundOption {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'white-noise';
  src: string;
  description: string;
}

const soundOptions: SoundOption[] = [
  {
    id: 'rain',
    name: 'Rainfall',
    category: 'nature',
    src: 'https://sounds-app.pages.dev/rain.mp3',
    description: 'Gentle rainfall to enhance focus',
  },
  {
    id: 'forest',
    name: 'Forest Ambience',
    category: 'nature',
    src: 'https://sounds-app.pages.dev/forest.mp3',
    description: 'Peaceful forest sounds with birds and leaves',
  },
  {
    id: 'waves',
    name: 'Ocean Waves',
    category: 'nature',
    src: 'https://sounds-app.pages.dev/waves.mp3',
    description: 'Calming ocean waves to reduce stress',
  },
  {
    id: 'cafe',
    name: 'Coffee Shop',
    category: 'ambient',
    src: 'https://sounds-app.pages.dev/cafe.mp3',
    description: 'Ambient coffee shop background noise',
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    category: 'white-noise',
    src: 'https://sounds-app.pages.dev/white-noise.mp3',
    description: 'Consistent white noise to mask distractions',
  },
];

const SoundControls: React.FC = () => {
  const { settings, status, mode } = useTimer();
  const [selectedSoundId, setSelectedSoundId] = useState<string>('rain');
  const [volume, setVolume] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, []);

  // Update audio source when sound selection changes
  useEffect(() => {
    const selectedSound = soundOptions.find(sound => sound.id === selectedSoundId);
    if (audioRef.current && selectedSound) {
      audioRef.current.src = selectedSound.src;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to play audio:', error);
          toast({
            title: "Sound playback error",
            description: "There was an issue playing the selected sound.",
            variant: "destructive",
          });
          setIsPlaying(false);
        });
      }
    }
  }, [selectedSoundId, isPlaying]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Auto-play logic based on timer status and settings
  useEffect(() => {
    if (!settings.soundEnabled) {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (status === 'running' && mode === 'focus' && settings.soundEnabled) {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to auto-play audio:', error);
        });
        setIsPlaying(true);
      }
    } else if (status === 'completed' || status === 'paused') {
      if (audioRef.current && isPlaying && mode !== 'focus') {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [status, mode, settings.soundEnabled, isPlaying]);

  // Toggle play/pause
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
        toast({
          title: "Sound playback error",
          description: "There was an issue playing the selected sound.",
          variant: "destructive",
        });
      });
      setIsPlaying(true);
    }
  };

  // Get current sound
  const currentSound = soundOptions.find(sound => sound.id === selectedSoundId);

  if (!settings.soundEnabled) {
    return null;
  }

  // Listen for voice commands
  useEffect(() => {
    const handlePlaySound = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to play audio via voice command:', error);
        });
        setIsPlaying(true);
      }
    };
    
    const handlePauseSound = () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    
    window.addEventListener('play-sound', handlePlaySound);
    window.addEventListener('pause-sound', handlePauseSound);
    
    return () => {
      window.removeEventListener('play-sound', handlePlaySound);
      window.removeEventListener('pause-sound', handlePauseSound);
    };
  }, [isPlaying]);

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium">Focus Sounds</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={togglePlayback}
          className={cn("h-8 w-8", isPlaying ? "text-green-500" : "")}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
      
      <Select 
        value={selectedSoundId} 
        onValueChange={setSelectedSoundId}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a sound" />
        </SelectTrigger>
        <SelectContent>
          {soundOptions.map(sound => (
            <SelectItem key={sound.id} value={sound.id}>
              {sound.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {currentSound && (
        <p className="text-sm text-muted-foreground">
          {currentSound.description}
        </p>
      )}
      
      <div className="flex items-center gap-3">
        <VolumeX className="h-4 w-4 text-gray-500" />
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0])}
          className="flex-1"
        />
        <Volume2 className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};

export default SoundControls;
