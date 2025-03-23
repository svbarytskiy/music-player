import { useState, useRef, useEffect } from "react";

const usePlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [currentTime, setCurrentTime] = useState(0);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setCurrentTime(audio.currentTime);
        };

        const updateDuration = () => {
            setCurrentTime(0); // скидаємо таймер при завантаженні нового треку
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", updateDuration);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", updateDuration);
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    }, [volume]);

    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (audioRef.current.paused) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const stopPlaying = () => {
        if (!audioRef.current) return;

        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const toggleVolume = () => {
        if (!audioRef.current) return;
        setVolume(audioRef.current.volume > 0 ? 0 : 0.5);
    };

    const seekAudio = (time: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration));
    };

    return {
        togglePlayPause,
        stopPlaying,
        setVolume,
        isPlaying,
        volume,
        audioRef,
        progress: (currentTime / (audioRef.current?.duration || 1)) * 100,
        currentTime,
        soundTime: audioRef.current?.duration || 0,
        toggleVolume,
        seekAudio
    };
};

export { usePlayer };
