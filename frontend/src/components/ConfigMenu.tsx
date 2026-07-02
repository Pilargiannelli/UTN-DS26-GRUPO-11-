import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import "../assets/styles/ConfigMenu.css";

type ConfigMenuProps = {
    onEditClick: () => void;
};

export const ConfigMenu = ({ onEditClick }: ConfigMenuProps) => {
    const { usuario } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if ( menuRef.current && !menuRef.current.contains(event.target as Node)) { setIsOpen(false); } };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);
    if (usuario?.rol !== 'admin') return null;
    const handleIconClick = () => { setIsOpen(prev => !prev); };
    return (
        <div className="config-menu">
            <button onClick={handleIconClick} className="config-button">
                <Settings className={`config-icon ${isOpen ? 'open' : ''}`} />
            </button>
            {isOpen && ( <div className="config-menu-dropdown">
                    <button onClick={() => { onEditClick(); setIsOpen(false); }} className="config-menu-dropdown-item">
                        Cambiar datos
                    </button>
                </div>
            )}
        </div>
    );
};