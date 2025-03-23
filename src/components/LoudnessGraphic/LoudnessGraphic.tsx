import { FC, useEffect, useRef } from 'react';
import WaveformDrawer from '../../helpers/useWaveFormDrawers';
import Drawer from '../../helpers/useWaveFormDrawers';


interface LoudnessGraphicProps {
    duration: number;
    audioBuffer: AudioBuffer | null;
}

const LoudnessGraphic: FC<LoudnessGraphicProps> = ({ audioBuffer }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const drawerRef = useRef<Drawer | null>(null); // Використовуємо твій Drawer

    useEffect(() => {
        if (containerRef.current && audioBuffer) {
            if (!drawerRef.current) {
                drawerRef.current = new Drawer(audioBuffer, containerRef.current);
            }
            drawerRef.current.init(); // Викликаємо init(), як у твоєму Drawer
        }
    }, [audioBuffer]);

    return <div ref={containerRef} style={{ width: '100%', height: '300px' }} />;
};

export { LoudnessGraphic };
