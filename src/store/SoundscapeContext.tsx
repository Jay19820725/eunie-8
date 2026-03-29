import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Soundscape {
  id: string;
  name: string;
  title?: string;
  artist?: string;
  category?: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  url: string;
}

export type PlaybackMode = 'list' | 'single';

interface SoundscapeContextType {
  isPlaying: boolean;
  currentSound: Soundscape | null;
  volume: number;
  playbackMode: PlaybackMode;
  tracks: Soundscape[];
  togglePlay: () => void;
  setSound: (id: string) => void;
  setVolume: (volume: number) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  nextTrack: () => void;
  isLoading: boolean;
}

const SoundscapeContext = createContext<SoundscapeContextType | undefined>(undefined);

export const SoundscapeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(() => {
    const saved = localStorage.getItem('eunie_audio_playing');
    return saved === 'true';
  });
  const [currentSound, setCurrentSound] = useState<Soundscape | null>(null);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('eunie_audio_volume');
    return saved ? parseFloat(saved) : 0.5;
  });
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(() => {
    const saved = localStorage.getItem('eunie_audio_mode') as PlaybackMode;
    return saved || 'list';
  });

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('eunie_audio_playing', isPlaying.toString());
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem('eunie_audio_volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('eunie_audio_mode', playbackMode);
  }, [playbackMode]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tracksRef = useRef<Soundscape[]>([]);
  const currentSoundRef = useRef<Soundscape | null>(null);
  const playbackModeRef = useRef<PlaybackMode>(playbackMode);

  // Use React Query to fetch tracks
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['music'],
    queryFn: async () => {
      const response = await fetch('/api/music');
      if (!response.ok) throw new Error('Failed to fetch music');
      return await response.json();
    }
  });

  // Keep refs in sync with state
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    currentSoundRef.current = currentSound;
  }, [currentSound]);

  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    const handleEnded = () => {
      if (playbackModeRef.current === 'single') {
        audio.currentTime = 0;
        audio.play().catch(err => console.error("Audio play failed:", err));
      } else {
        // Use the functional approach to get latest state if needed, 
        // but here we use refs for simplicity and reliability in the listener
        const currentTracks = tracksRef.current;
        const currentS = currentSoundRef.current;
        
        if (currentTracks.length === 0) return;
        
        const currentIndex = currentS ? currentTracks.findIndex(t => t.id === currentS.id) : -1;
        const nextIndex = (currentIndex + 1) % currentTracks.length;
        
        setCurrentSound(currentTracks[nextIndex]);
        setIsPlaying(true);
      }
    };

    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (currentSound) {
      audioRef.current.src = currentSound.url;
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error("Audio play failed:", err));
      }
    } else {
      audioRef.current.pause();
    }
  }, [currentSound]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (audioRef.current.src) {
        audioRef.current.play().catch(err => console.error("Audio play failed:", err));
      } else if (tracks.length > 0) {
        setCurrentSound(tracks[0]);
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const nextTrack = () => {
    if (tracks.length === 0) return;
    
    const currentIndex = currentSound ? tracks.findIndex(t => t.id === currentSound.id) : -1;
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentSound(tracks[nextIndex]);
    if (!isPlaying) setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentSound && tracks.length > 0) {
      setCurrentSound(tracks[0]);
    }
    setIsPlaying(!isPlaying);
  };

  const setSound = (id: string) => {
    const sound = tracks.find(s => s.id === id);
    if (sound) {
      setCurrentSound(sound);
      setIsPlaying(true);
    }
  };

  return (
    <SoundscapeContext.Provider value={{ 
      isPlaying, 
      currentSound, 
      volume, 
      playbackMode, 
      tracks,
      togglePlay, 
      setSound, 
      setVolume, 
      setPlaybackMode,
      nextTrack,
      isLoading
    }}>
      {children}
    </SoundscapeContext.Provider>
  );
};

export const useSoundscape = () => {
  const context = useContext(SoundscapeContext);
  if (context === undefined) {
    throw new Error('useSoundscape must be used within a SoundscapeProvider');
  }
  return context;
};
