import { FC, useState } from "react";
import "./Upload.css";
// import jsmediatags from "jsmediatags";


interface UploadProps {
    onFileUpload: (file: File) => void;
 }

const Upload: FC<UploadProps> = ({onFileUpload}) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            onFileUpload(e.target.files[0]);
            setFile(e.target.files[0]);
        }
       
    };


    return (
        <div className="upload-container">
            <input type="file" className="upload" onChange={handleFileChange} />
            {file && <p className="file-name">Selected file: {file.name}</p>}
        </div>
    );
};

export { Upload };
