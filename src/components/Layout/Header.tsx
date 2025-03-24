import { FC } from "react";
import './Header.css';
interface HeaderProps { }

const Header: FC<HeaderProps> = () => {
    return (
        <header className="header">
            <nav className="nav">
                <a href="/" className="logo">MusicPlayer</a>
                <ul className="nav-list">
                    <li><a href="/" className="nav-link">Home</a></li>
                    <li><a href="/about" className="nav-link">About</a></li>
                    <li><a href="/contact" className="nav-link">Contact</a></li>
                </ul>
            </nav>
        </header>

    );
}
export { Header }