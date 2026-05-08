"use client";

export interface ControllerPricing {
    ps4: { DAILY: number; WEEKLY: number; MONTHLY: number };
    ps5: { DAILY: number; WEEKLY: number; MONTHLY: number };
    xbox: { DAILY: number; WEEKLY: number; MONTHLY: number };
    switch: { DAILY: number; WEEKLY: number; MONTHLY: number };
    vr: { DAILY: number; WEEKLY: number; MONTHLY: number };
}

export interface ControllerHysteresis {
    ps4: { minPrice: number; maxPrice: number; priceAdjustmentBand: number; stockAlertBuffer: number; availabilityThresholdBuffer: number };
    ps5: { minPrice: number; maxPrice: number; priceAdjustmentBand: number; stockAlertBuffer: number; availabilityThresholdBuffer: number };
    xbox: { minPrice: number; maxPrice: number; priceAdjustmentBand: number; stockAlertBuffer: number; availabilityThresholdBuffer: number };
    switch: { minPrice: number; maxPrice: number; priceAdjustmentBand: number; stockAlertBuffer: number; availabilityThresholdBuffer: number };
    vr: { minPrice: number; maxPrice: number; priceAdjustmentBand: number; stockAlertBuffer: number; availabilityThresholdBuffer: number };
}

export interface ControllerSettings {
    maxQuantity: number;
    pricing: ControllerPricing;
    hysteresis: ControllerHysteresis;
}

const DEFAULT_CONTROLLER_SETTINGS: ControllerSettings = {
    maxQuantity: 4,
    pricing: {
        ps4: { DAILY: 50, WEEKLY: 250, MONTHLY: 800 },
        ps5: { DAILY: 80, WEEKLY: 400, MONTHLY: 1200 },
        xbox: { DAILY: 70, WEEKLY: 350, MONTHLY: 1000 },
        switch: { DAILY: 40, WEEKLY: 200, MONTHLY: 600 },
        vr: { DAILY: 100, WEEKLY: 500, MONTHLY: 1500 }
    },
    hysteresis: {
        ps4: { minPrice: 40, maxPrice: 100, priceAdjustmentBand: 10, stockAlertBuffer: 5, availabilityThresholdBuffer: 2 },
        ps5: { minPrice: 60, maxPrice: 150, priceAdjustmentBand: 15, stockAlertBuffer: 3, availabilityThresholdBuffer: 1 },
        xbox: { minPrice: 50, maxPrice: 130, priceAdjustmentBand: 12, stockAlertBuffer: 4, availabilityThresholdBuffer: 2 },
        switch: { minPrice: 30, maxPrice: 80, priceAdjustmentBand: 8, stockAlertBuffer: 6, availabilityThresholdBuffer: 3 },
        vr: { minPrice: 80, maxPrice: 200, priceAdjustmentBand: 20, stockAlertBuffer: 2, availabilityThresholdBuffer: 1 }
    }
};

export const getControllerSettings = (): ControllerSettings => {
    const stored = localStorage.getItem('gv_controller_settings');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (!parsed || typeof parsed !== 'object') {
                return DEFAULT_CONTROLLER_SETTINGS;
            }
            return parsed as ControllerSettings;
        } catch {
            return DEFAULT_CONTROLLER_SETTINGS;
        }
    }
    return DEFAULT_CONTROLLER_SETTINGS;
};

export const saveControllerSettings = (settings: ControllerSettings) => {
    localStorage.setItem('gv_controller_settings', JSON.stringify(settings));
};

export const resetControllerSettings = () => {
    localStorage.removeItem('gv_controller_settings');
};
