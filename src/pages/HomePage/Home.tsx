import { useState } from "react";
import { Player } from "../../components/Player/Player"
import { Upload } from "../../components/Upload/Upload"

const Home = () => {

    const [audioSrc, setAudioSrc] = useState<string | null>(null);

    const handleFileUpload = (file: File) => {
        const objectUrl = URL.createObjectURL(file);
        setAudioSrc(objectUrl);
    };

    return (
        <div>
            <Upload onFileUpload={handleFileUpload} />
            <Player audioSrc={audioSrc} author={""} title={""} />
        </div>
    )
}
export { Home }