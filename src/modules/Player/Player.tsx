import { FC } from "react";
import "./Player.css";
import { LoudnessGraphic } from "../../components/LoudnessGraphic/LoudnessGraphic";
import { ToolBar } from "../../components/ToolBar/ToolBar";
import { Upload } from "../../components/Upload/Upload";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

const Player: FC = () => {
    const {
        loudnessRef,
        duration,
        audioBuffer,
        isPlaying,
        volume,
        progress,
        currentTime,
        uploadAudio,
        togglePlayPause,
        changeVolume,
        toggleVolume,
        stopPlaying,
        handleProgressChange,
        loading
    } = useAudioPlayer();

    return (
        <>
            <Upload onFileUpload={uploadAudio} />
            <section className="player">
                <LoudnessGraphic
                    duration={duration}
                    audioBuffer={audioBuffer} updateProgress={handleProgressChange} progress={progress} containerRef={loudnessRef} loading={loading} />
                <ToolBar
                    updateProgress={handleProgressChange}
                    progress={progress}
                    togglePlayPause={togglePlayPause}
                    isPlay={isPlaying}
                    currentTime={currentTime}
                    soundTime={duration}
                    volume={volume}
                    stopPlaying={stopPlaying}
                    changeVolume={changeVolume}
                    toggleVolume={toggleVolume}
                />
            </section>
        </>
    );
};

export { Player };
