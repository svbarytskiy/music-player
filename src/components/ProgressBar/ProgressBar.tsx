import { FC } from "react";
import "./ProgressBar.css";

interface ProgressBarProps {
    updateProgress: (progress: number) => void;
    progress: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ updateProgress, progress }) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const newProgress = Math.min(Math.max((offsetX / rect.width) * 100, 0), 100);

        updateProgress(newProgress); // Викликає handleProgressChange
    };

    return (
        <div className="progress-bar" onClick={handleClick}>
            <div className="progress-bar__fill" style={{ width: `${progress}%` }}></div>
            <div className="progress-bar__thumb" style={{ left: `calc(${progress}% - 6px)` }}></div>
        </div>
    );
};

export { ProgressBar };
