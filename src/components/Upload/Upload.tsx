import { FC, useState } from "react";
import "./Upload.css";

interface UploadProps {
    onFileUpload: (file: File) => void;
}

const Upload: FC<UploadProps> = ({ onFileUpload }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const newFile = e.target.files[0];
            onFileUpload(newFile);
            setFile(newFile);
        }
    };

    return (
        <div className="upload-container">
            <input 
                type="file" 
                className="upload" 
                onChange={handleFileChange} 
                key={file ? file.name : "fileInput"}
            />
            {file && <p className="file-name">Selected file: {file.name}</p>}
        </div>
    );
};

export { Upload };
