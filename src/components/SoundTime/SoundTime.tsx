import { FC } from "react";
import './SoundTime.css';

interface SoundTimeProps {
    currentTime: number;
    soundTime: number;
}

const SoundTime: FC<SoundTimeProps> = ({ currentTime, soundTime }) => {

    return (
        <div className="">
            <span>{Math.floor(currentTime / 60) + ':' + ('0' + Math.floor(currentTime % 60)).slice(-2)}</span>
            <span>/</span>
            <span>{Math.floor(soundTime / 60) + ':' + ('0' + Math.floor(soundTime % 60)).slice(-2)}</span>
        </div>)
}
export { SoundTime }