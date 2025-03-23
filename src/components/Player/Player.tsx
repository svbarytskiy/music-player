import { FC, useEffect, useState } from 'react';
import './Player.css';
import { usePlayer } from '../../helpers/usePlayer';
import { LoudnessGraphic } from '../LoudnessGraphic/LoudnessGraphic';
import { ToolBar } from '../ToolBar/ToolBar';

interface PlayerProps {
    author: string;
    title: string;
    audioSrc: string | null;
}

const Player: FC<PlayerProps> = ({ author, title, audioSrc }) => {
    const { togglePlayPause,
        stopPlaying,
        setVolume,
        isPlaying,
        volume,
        audioRef,
        progress,
        currentTime,
        soundTime,
        toggleVolume
    } = usePlayer()

    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    useEffect(() => {
        if (!audioSrc) return;

        const fetchAudioBuffer = async () => {
            try {
                const audioContext = new AudioContext();
                const response = await fetch(audioSrc);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = await audioContext.decodeAudioData(arrayBuffer);
                setAudioBuffer(buffer);
            } catch (error) {
                console.error("Помилка при отриманні AudioBuffer:", error);
            }
        };

        fetchAudioBuffer();
    }, [audioSrc]);
    return (
        <section className="player">
            <LoudnessGraphic duration={soundTime} audioBuffer={audioBuffer} />
            <p>{author}</p>
            <p>{title}</p>
            <audio ref={audioRef} src={audioSrc || ''} />
            <ToolBar
                updateProgress={() => { }}
                progress={progress}
                togglePlayPause={togglePlayPause}
                isPlay={isPlaying}
                currentTime={currentTime}
                soundTime={soundTime}
                volume={volume}
                stopPlaying={stopPlaying}
                changeVolume={setVolume}
                toggleVolume={toggleVolume} />
        </section>
    );
}
export { Player }