import { FC } from "react";
import './Footer.css';


interface FooterProps { }

const Footer: FC<FooterProps> = () => {
    return (
        <footer className="footer">
            <p>© 2021 Music Player</p>
        </footer>
    );
}
export { Footer }