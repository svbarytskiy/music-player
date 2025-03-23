import { FC } from "react";
import "./ToolBar.css";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { SoundTime } from "../SoundTime/SoundTime";
import { Pause, Play, Square } from "lucide-react";
import { ChangeSound } from "../ChangeSound/ChangeSound";

interface ToolBarProps {
    updateProgress: (progress: number) => void;
    progress: number;
    togglePlayPause: () => void;
    isPlay: boolean;
    currentTime: number;
    soundTime: number;
    volume: number;
    changeVolume: (volume: number) => void;
    stopPlaying: () => void;
    toggleVolume: () => void;
}

const ToolBar: FC<ToolBarProps> = ({
    updateProgress,
    progress,
    togglePlayPause,
    isPlay,
    currentTime,
    soundTime,
    volume,
    changeVolume,
    stopPlaying,
    toggleVolume,
}) => {
    return (
        <footer className="toolbar">
            <ProgressBar updateProgress={updateProgress} progress={progress} />
            <div className="toolbar__controls">
                <button className="toolbar__button" onClick={togglePlayPause} aria-label={isPlay ? "Pause" : "Play"}>
                    {isPlay ? <Pause /> : <Play />}
                </button>
                <button className="toolbar__button" onClick={stopPlaying} aria-label="Stop">
                    <Square />
                </button>
                <SoundTime currentTime={currentTime} soundTime={soundTime} />
                <ChangeSound toggleVolume={toggleVolume} volume={volume} changeVolume={changeVolume} />
            </div>
        </footer>
    );
};

export { ToolBar };
