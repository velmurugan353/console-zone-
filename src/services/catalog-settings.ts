"use client";

export type PlanConfig = {
    price: number;
    features: string[];
};

export interface CatalogSettings {
    [categoryName: string]: {
        daily: PlanConfig;
        weekly: PlanConfig;
        monthly: PlanConfig;
        securityDeposit: number;
        totalStock: number;
    };
}

const DEFAULT_CATALOG_SETTINGS: CatalogSettings = {
    "Sony PlayStation 5": {
        daily: { price: 2500, features: ["2 controllers included", "2 base games", "4K HDMI cable"] },
        weekly: { price: 10000, features: ["2 controllers included", "4 premium games", "Priority swap support"] },
        monthly: { price: 28000, features: ["2 controllers included", "Unlimited game swaps", "Damage protection waiver"] },
        securityDeposit: 5000,
        totalStock: 12
    },
    "Xbox Series X": {
        daily: { price: 2000, features: ["2 controllers included", "Game Pass Ultimate", "Ultra High Speed HDMI"] },
        weekly: { price: 8500, features: ["2 controllers included", "5 premium games", "Quick resume support"] },
        monthly: { price: 24000, features: ["2 controllers included", "Full library access", "No-deposit protocol"] },
        securityDeposit: 4500,
        totalStock: 8
    },
    "PlayStation 4 Pro": {
        daily: { price: 1500, features: ["2 controllers included", "1 base game", "HDMI cable"] },
        weekly: { price: 6500, features: ["2 controllers", "2 premium games"] },
        monthly: { price: 18000, features: ["2 controllers", "4 monthly game swaps"] },
        securityDeposit: 3000,
        totalStock: 5
    },
    "Nintendo Switch OLED": {
        daily: { price: 1200, features: ["Cleaned & sanitized", "Carrying case", "Digital library pre-loaded"] },
        weekly: { price: 5500, features: ["Extra battery packs", "Full library access"] },
        monthly: { price: 15000, features: ["Maximum kit tier", "Accidental damage buffer"] },
        securityDeposit: 3500,
        totalStock: 15
    },
    "Meta Quest 3": {
        daily: { price: 1500, features: ["2 Touch Plus controllers", "Lens cleaning kit", "Mixed Reality setup"] },
        weekly: { price: 7500, features: ["Extended battery strap", "5 premium VR titles", "Priority tech support"] },
        monthly: { price: 22000, features: ["Unlimited game access", "Hardware swap protection", "Enterprise hygiene kit"] },
        securityDeposit: 10000,
        totalStock: 5
    }
};

export const getCatalogSettings = (): CatalogSettings => {
    const stored = localStorage.getItem('gv_catalog_settings');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (!parsed || typeof parsed !== 'object') {
                return DEFAULT_CATALOG_SETTINGS;
            }
            // Merge with defaults to ensure new fields (deposit, stock) are present
            const merged = { ...DEFAULT_CATALOG_SETTINGS };
            
            Object.keys(parsed).forEach(key => {
                if (merged[key]) {
                    merged[key] = { ...merged[key], ...parsed[key] };
                } else {
                    merged[key] = parsed[key];
                }
            });
            
            return merged;
        } catch {
            return DEFAULT_CATALOG_SETTINGS;
        }
    }
    return DEFAULT_CATALOG_SETTINGS;
};

export const saveCatalogSettings = (settings: CatalogSettings) => {
    localStorage.setItem('gv_catalog_settings', JSON.stringify(settings));
};

export const resetCatalogSettings = () => {
    localStorage.removeItem('gv_catalog_settings');
};
