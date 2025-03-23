import { FC } from "react";
import "./Player.css";
import { LoudnessGraphic } from "../LoudnessGraphic/LoudnessGraphic";
import { ToolBar } from "../ToolBar/ToolBar";
import { Upload } from "../Upload/Upload";
import { useAudioPlayer } from "../../helpers/useAudioPlayer";

const Player: FC = () => {
    const {
        loudnessRef,
        soundDriver,
        isPlaying,
        volume,
        progress,
        currentTime,
        uploadAudio,
        togglePlayPause,
        changeVolume,
        toggleVolume,
        stopPlaying,
        handleProgressChange
    } = useAudioPlayer();

    return (
        <>
            <Upload onFileUpload={uploadAudio} />
            <section className="player">
                <div ref={loudnessRef}></div>
                <LoudnessGraphic
                    duration={soundDriver?.getBuffer()?.duration ?? 0}
                    audioBuffer={soundDriver?.getBuffer() ?? null} updateProgress={handleProgressChange} progress={progress} />
                <ToolBar
                    updateProgress={handleProgressChange}
                    progress={progress}
                    togglePlayPause={togglePlayPause}
                    isPlay={isPlaying}
                    currentTime={currentTime}
                    soundTime={soundDriver?.getBuffer()?.duration ?? 0}
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
