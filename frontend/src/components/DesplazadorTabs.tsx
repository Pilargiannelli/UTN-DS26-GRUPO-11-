import { useState } from 'react';
import '../assets/styles/Tabs.css';
import type { DesplazadorTabsProps } from '../types/TabsProps.ts';

export function DesplazadorTabs({ tabs }: DesplazadorTabsProps) {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div className="tabs-container">
            {/* Botones/Labels de Selección */}
            <div className="tabs-header">
                {tabs.map((tab, index) => (
                    <button key={index} className={`tab-button ${activeTab === index ? 'active' : ''}`} onClick={() => setActiveTab(index)}>
                        {tab.label}
                    </button>
                ))}
                {/* Línea decorativa inferior animada (opcional) */}
                <div className="tab-indicator" style={{ width: `${100 / tabs.length}%`, transform: `translateX(${activeTab * 100}%)` }}/>
            </div>
            {/* Contenedor con Efecto Desplazamiento */}
            <div className="tabs-content-wrapper">
                <div className="tabs-content-slider" style={{ transform: `translateX(-${activeTab * 100}%)`, width: `${tabs.length * 100}%` }}>
                    {tabs.map((tab, index) => (
                        <div key={index} className="tab-content-pane" style={{ width: `${100 / tabs.length}%` }}>
                            {tab.component}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}