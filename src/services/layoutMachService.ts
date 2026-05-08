import { useState, useEffect } from 'react';

export type ViewportMode = 'phone' | 'tab' | 'desktop';

export interface LayoutProtocol {
    mode: ViewportMode;
    agentName: string;
    description: string;
    features: string[];
}

const PROTOCOLS: Record<ViewportMode, LayoutProtocol> = {
    phone: {
        mode: 'phone',
        agentName: 'Mobile Sentinel',
        description: 'Optimizing for high-density touch input and condensed data.',
        features: ['Bottom Navigation', 'Stack Cards', 'Drawer Menus', 'Compact Metrics']
    },
    tab: {
        mode: 'tab',
        agentName: 'Tablet Navigator',
        description: 'Synchronizing hybrid touch and cursor interaction matrix.',
        features: ['Semi-expanded Sidebars', '2-Column Grids', 'Context Menus', 'Split Views']
    },
    desktop: {
        mode: 'desktop',
        agentName: 'Desktop Commander',
        description: 'Enabling full data bandwidth and advanced Matrix visual effects.',
        features: ['Full Sidebar', '4-Column Grids', 'Hover Tooltips', 'Live Analytics Matrix']
    }
};

export const useLayoutMach = () => {
    const [mode, setMode] = useState<ViewportMode>('desktop');
    const [protocol, setProtocol] = useState<LayoutProtocol>(PROTOCOLS.desktop);

    useEffect(() => {
        const updateLayout = () => {
            const width = window.innerWidth;
            let newMode: ViewportMode = 'desktop';
            
            if (width < 768) {
                newMode = 'phone';
            } else if (width < 1024) {
                newMode = 'tab';
            } else {
                newMode = 'desktop';
            }

            if (newMode !== mode) {
                setMode(newMode);
                setProtocol(PROTOCOLS[newMode]);
                console.log(`[MACH_ORCHESTRATOR] Viewport synchronization: ${newMode.toUpperCase()} Protocol Active.`);
            }
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, [mode]);

    return { mode, protocol };
};
