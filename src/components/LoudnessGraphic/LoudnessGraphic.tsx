import { FC, useEffect, useRef } from 'react';
import Drawer from '../../services/Drawer';


interface LoudnessGraphicProps {
    duration: number;
    audioBuffer: AudioBuffer | null;
    updateProgress: (progress: number) => void;
    progress: number;
}

const LoudnessGraphic: FC<LoudnessGraphicProps> = ({ audioBuffer, progress, updateProgress }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const drawerRef = useRef<Drawer | null>(null);
    
    useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.updateCursorPercentage(progress);
        }
    }, [progress]);

    useEffect(() => {
        if (containerRef.current && audioBuffer) {
            if (!drawerRef.current) {
                drawerRef.current = new Drawer(audioBuffer, containerRef.current, undefined, updateProgress);
            }
            drawerRef.current.init();
        }
    }, [audioBuffer]);

    return <div ref={containerRef} style={{ width: '100%', height: '300px' }} />;
};

export { LoudnessGraphic };
