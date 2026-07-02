import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import type { ConfigMenuProps } from '../types/ConfigMenuProps';
import "../assets/styles/ConfigMenu.css";

export const ConfigMenu = ({ onEditClick, onPasswordClick, canChangePassword, canEdit }: ConfigMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if ( menuRef.current && !menuRef.current.contains(event.target as Node)) { setIsOpen(false); } };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);
    const handleIconClick = () => { setIsOpen(prev => !prev); };
    return (
        <div className="config-menu">
            <button onClick={handleIconClick} className="config-button">
                <Settings className={`config-icon ${isOpen ? 'open' : ''}`} />
            </button>
            {isOpen && ( <div className="config-menu-dropdown">
                    {canEdit && (
                        <button onClick={() => { onEditClick?.(); setIsOpen(false); }} className="config-menu-dropdown-item">
                            Cambiar datos
                        </button>
                    )}
                    {canChangePassword && (
                        <button onClick={() => { onPasswordClick?.(); setIsOpen(false); }} className="config-menu-dropdown-item">
                            Cambiar contraseña
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};