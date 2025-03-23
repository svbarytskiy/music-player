import { FC } from "react"
import './ToolBar.css'
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { SoundTime } from "../SoundTime/SoundTime";
import { Pause, Play, Square } from "lucide-react";
import { ChangeSound } from "../ChangeSound/ChangeSound";

interface ToolBarProps {
    updateProgress: (progress: number) => void; // Функція для оновлення прогресу
    progress: number; // Прогрес пісні (у відсотках)
    togglePlayPause: () => void; // Функція для перемикання відтворення/паузи
    isPlay: boolean; // Статус відтворення (грає чи на паузі)
    // SkipTime: (direction: 'forward' | 'backward') => void; // Функція для скіпу часу вперед/назад
    currentTime: number; // Поточний час пісні
    soundTime: number; // Загальний час пісні
    volume: number; // Поточний рівень гучності
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
    toggleVolume
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
    )
}
export { ToolBar }