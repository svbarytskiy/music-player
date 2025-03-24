import { FC, useEffect, useRef } from 'react';
import Drawer from '../../services/Drawer';


interface LoudnessGraphicProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    duration: number;
    audioBuffer: AudioBuffer | null;
    updateProgress: (progress: number) => void;
    progress: number;
    loading: boolean;
}

const LoudnessGraphic: FC<LoudnessGraphicProps> = ({ audioBuffer, progress, updateProgress, containerRef, loading }) => {
    const drawerRef = useRef<Drawer | null>(null);

    useEffect(() => {
        if (drawerRef.current) {
            drawerRef.current.updateCursorPercentage(progress);
        }
    }, [progress]);

    useEffect(() => {
        const initializeDrawer = () => {
            if (containerRef.current && audioBuffer) {
                containerRef.current.innerHTML = "";
                drawerRef.current = null;
                drawerRef.current = new Drawer(audioBuffer, containerRef.current, undefined, updateProgress);
                drawerRef.current.init();
            }
        };

        initializeDrawer();
    }, [audioBuffer]);


    if (loading) { return <div>Loading...</div>; }

    return <div ref={containerRef} style={{ width: '100%', height: '300px' }} />;
};

export { LoudnessGraphic };
