import { FC } from "react";
import "./ChangeSound.css";
import { Volume2, VolumeX } from "lucide-react";

interface ChangeSoundProps {
    volume: number;
    changeVolume: (volume: number) => void;
    toggleVolume: () => void;
}

const ChangeSound: FC<ChangeSoundProps> = ({ volume, changeVolume, toggleVolume }) => {
    return (
        <div className="change-sound-container">
            <button className="volume-button" onClick={toggleVolume}>
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="volume-slider"
            />
        </div>
    );
};

export { ChangeSound };
