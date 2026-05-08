import { filterAvailableUnits } from './rentalAvailability';

export interface RentalUnit {
    id: string;
    serialNumber: string;
    status: 'Available' | 'Rented' | 'Maintenance' | 'Retired' | 'available' | 'rented' | 'maintenance' | 'damaged';
    health: number;
    usageCount: number;
    name: string;
}

const ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
const API_URL = ENV.VITE_API_URL || '';

export const rentalService = {
    /**
     * Finds available units for a specific console model and date range
     */
    checkAvailability: async (consoleId: string, startDate: Date, endDate: Date) => {
        try {
            console.log(`[RENTAL_SERVICE] Checking availability for ${consoleId} from ${startDate} to ${endDate}`);
            
            // Fetch inventory from MongoDB
            const inventoryRes = await fetch(`${API_URL}/api/inventory`);
            if (!inventoryRes.ok) throw new Error("Failed to fetch inventory");
            let allUnits = await inventoryRes.json().catch(() => []);
            console.log(`[RENTAL_SERVICE] Fetched ${allUnits.length} units from inventory`);
            
            // Virtual Fleet Fallback Protocol
            if (allUnits.length === 0) {
                console.log("[RENTAL_SERVICE] Physical matrix unpopulated. Initializing Virtual_Fleet_Fallback.");
                allUnits = [
                    { id: 'v-ps5-1', name: 'Sony PlayStation 5 Pro', status: 'Available', category: 'Console', serialNumber: 'V-PS5-PRO-001' },
                    { id: 'v-ps5-2', name: 'Sony PlayStation 5', status: 'Available', category: 'Console', serialNumber: 'V-PS5-STD-001' },
                    { id: 'v-xbox-1', name: 'Xbox Series X', status: 'Available', category: 'Console', serialNumber: 'V-XBOX-X-001' },
                    { id: 'v-switch-1', name: 'Nintendo Switch OLED', status: 'Available', category: 'Console', serialNumber: 'V-SWITCH-O-001' }
                ];
            }

            // Fetch existing rentals to check for overlaps
            const rentalsRes = await fetch(`${API_URL}/api/rentals`);
            if (!rentalsRes.ok) throw new Error("Failed to fetch rentals");
            const existingRentals = await rentalsRes.json().catch(() => []);
            console.log(`[RENTAL_SERVICE] Fetched ${existingRentals.length} existing rentals`);
            
            // Normalize units for the filter (handle both id and _id)
            const normalizedUnits = allUnits.map((u: any) => ({ ...u, id: u.id || u._id }));

            const availableUnits = filterAvailableUnits(normalizedUnits, existingRentals, consoleId, startDate, endDate);
            console.log(`[RENTAL_SERVICE] Final available units count: ${availableUnits.length}`);

            return {
                available: availableUnits.length > 0,
                units: availableUnits,
                count: availableUnits.length
            };
        } catch (error) {
            console.error("Availability check failed:", error);
            return { available: false, units: [], error };
        }
    },

    /**
     * Processes a return with condition assessment
     */
    processReturn: async (rentalId: string, unitId: string, condition: 'good' | 'minor' | 'major', repairCost: number = 0) => {
        try {
            // 1. Update Rental Status
            const rentalUpdateRes = await fetch(`${API_URL}/api/rentals/${rentalId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'completed',
                    returnCondition: condition,
                    repairCost: repairCost,
                    returnedAt: new Date().toISOString()
                })
            });

            if (!rentalUpdateRes.ok) throw new Error("Failed to update rental status");

            // 2. Update Inventory Unit
            const inventoryRes = await fetch(`${API_URL}/api/inventory`);
            const allUnits = await inventoryRes.json().catch(() => []);
            const unit = allUnits.find((u: any) => (u.id || u._id) === unitId);
            
            if (unit) {
                let newStatus = 'Available';
                let healthPenalty = 0;

                if (condition === 'minor') healthPenalty = 5;
                if (condition === 'major') {
                    healthPenalty = 20;
                    newStatus = 'Maintenance';
                }

                await fetch(`${API_URL}/api/inventory/${unitId || unit._id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        status: newStatus,
                        health: Math.max(0, (unit.health || 100) - healthPenalty),
                        usageCount: (unit.usageCount || 0) + 1,
                        lastService: new Date().toISOString()
                    })
                });
            }

            return { success: true };
        } catch (error) {
            console.error("Return processing failed:", error);
            throw error;
        }
    },

    /**
     * Automatically calculates late fees
     */
    calculateLateFees: (endDate: string, hourlyRate: number = 100) => {
        const end = new Date(endDate);
        const now = new Date();
        
        if (now <= end) return 0;

        const diffInMs = now.getTime() - end.getTime();
        const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
        
        return diffInHours * hourlyRate;
    }
};
