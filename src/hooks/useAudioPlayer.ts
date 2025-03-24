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
    const soundController = useRef<SoundDriver | null>(null);
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
            soundController.current = soundInstance;
            setSoundDriver(soundInstance);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            soundInstance.drawChart();
        }
    }, []);

    const togglePlayPause = async () => {
        if (!soundDriver) return;

        setIsPlaying((prev) => {
            if (prev) {
                soundDriver.pause();
            } else {
                soundDriver.play();
            }
            return !prev;
        });
    };

    const changeVolume = (newVolume: number) => {
        if (!soundDriver) return;
        soundDriver.changeVolume(newVolume);
        setVolume(newVolume);
    };

    const toggleVolume = () => {
        setVolume((prev) => {
            const newVolume = prev === 0 ? prevVolume : 0;
            if (soundDriver) soundDriver.changeVolume(newVolume);
            if (prev !== 0) setPrevVolume(prev); // Зберігаємо попередню гучність
            return newVolume;
        });
    };

    const stopPlaying = () => {
        if (!soundDriver) return;
        soundDriver.pause(true); // Викликаємо паузу та скидаємо трек
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    };

    const handleProgressChange = (progress: number) => {
        soundDriver?.setCurrentTimeByPercentage(progress);
        setProgress(progress);
    };


    useEffect(() => {
        if (!soundDriver) return;

        const updateProgress = () => {
            const buffer = soundDriver.getBuffer();
            if (!buffer) return;

            const time = soundDriver.getCurrentTime();
            setCurrentTime(time);
            setProgress((time / buffer.duration) * 100);
            if ((time / buffer.duration) * 100 >= 100) {
                stopPlaying();
            }
        };

        const interval = setInterval(updateProgress, 500);
        return () => clearInterval(interval);
    }, [soundDriver]);

    return {
        loudnessRef,
        soundDriver,
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
        handleProgressChange
    };
};
