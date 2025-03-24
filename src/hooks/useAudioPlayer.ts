import { useState, useRef, useCallback, useEffect } from "react";
import SoundDriver from "../services/SoundDriver";

export const useAudioPlayer = () => {
    const [soundDriver, setSoundDriver] = useState<SoundDriver | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const loudnessRef = useRef<HTMLDivElement | null>(null);
    const [prevVolume, setPrevVolume] = useState(1);

    const uploadAudio = useCallback(async (file: File) => {
        if (!file.type.includes("audio")) {
            console.error("Wrong audio file");
            return;
        }
        setLoading(true);
        const soundInstance = new SoundDriver(file);
        try {
            if (loudnessRef.current) {
                await soundInstance.init(loudnessRef.current);
            }
            setSoundDriver(soundInstance);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            // soundInstance.drawChart();
        }
    }, []);

    const togglePlayPause = useCallback(async () => {
        if (!soundDriver) return;
        if (isPlaying) {
            await soundDriver.pause();
            setIsPlaying(false);
        } else {
            await soundDriver.play();
            setIsPlaying(true);
        }
    }, [soundDriver, isPlaying]);

    const changeVolume = useCallback((newVolume: number) => {
        if (!soundDriver) return;
        soundDriver.changeVolume(newVolume);
        setVolume(newVolume);
    }, [soundDriver]);

    const toggleVolume = useCallback(() => {
        setVolume((prev) => {
            const newVolume = prev === 0 ? prevVolume : 0;
            if (soundDriver) soundDriver.changeVolume(newVolume);
            if (prev !== 0) setPrevVolume(prev);
            return newVolume;
        });
    }, [soundDriver, prevVolume]);

    const stopPlaying = useCallback(async () => {
        if (!soundDriver) return;
        soundDriver.pause(true).catch(console.error);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    }, [soundDriver]);

    const handleProgressChange = useCallback((progress: number) => {
        if (!soundDriver || !soundDriver.getBuffer()) return;
        const duration = soundDriver.getBuffer()!.duration;
        const newTime = (duration * progress) / 100;
        soundDriver.setCurrentTime(newTime);
        setProgress(progress);
    }, [soundDriver]);

    useEffect(() => {
        if (!soundDriver) return;
        const updateProgress = () => {
            const buffer = soundDriver.getBuffer();
            if (!buffer) return;
            const time = soundDriver.getCurrentTime();
            setCurrentTime(time);
            const prog = (time / buffer.duration) * 100;
            setProgress(prog);
            if (prog >= 100) {
                stopPlaying();
            }
        };
        const interval = setInterval(updateProgress, 100);
        return () => clearInterval(interval);
    }, [soundDriver, stopPlaying]);
    
    const duration = soundDriver?.getBuffer()?.duration ?? 0;
    const audioBuffer = soundDriver?.getBuffer() ?? null;

    return {
        loudnessRef,
        duration,
        audioBuffer,
        isPlaying,
        volume,
        loading,
        progress,
        currentTime,
        uploadAudio,
        togglePlayPause,
        changeVolume,
        toggleVolume,
        stopPlaying,
        handleProgressChange,
        
    };
};
