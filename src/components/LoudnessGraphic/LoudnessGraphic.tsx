import { FC, useEffect, useRef } from 'react';
import Drawer from '../../helpers/Drawer';


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
                // Передаємо updateProgress при ініціалізації Drawer
                drawerRef.current = new Drawer(audioBuffer, containerRef.current, undefined, updateProgress);
            }
            drawerRef.current.init(); // Викликаємо init() як раніше
        }
    }, [audioBuffer]);

    return <div ref={containerRef} style={{ width: '100%', height: '300px' }} />;
};

export { LoudnessGraphic };
