import { areIntervalsOverlapping } from 'date-fns';
import { RENTAL_CONSOLES } from '../constants/rentals';

type InventoryLike = {
  id: string;
  productId?: string;
  consoleId?: string;
  name?: string;
  serialNumber?: string;
  status?: string;
};

type RentalLike = {
  unitId?: string;
  productId?: string;
  consoleId?: string;
  productName?: string;
  consoleName?: string;
  status?: string;
  startDate?: string | Date;
  endDate?: string | Date;
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const aliasToKey = new Map<string, string>();

const registerAlias = (alias: string, key: string) => {
  const normalized = normalizeToken(alias);
  if (normalized) aliasToKey.set(normalized, key);
};

for (const consoleDef of RENTAL_CONSOLES) {
  registerAlias(consoleDef.id, consoleDef.id);
  registerAlias(consoleDef.slug, consoleDef.id);
  registerAlias(consoleDef.name, consoleDef.id);
}

console.log(`[AVAILABILITY] Registered ${aliasToKey.size} aliases from RENTAL_CONSOLES`);

registerAlias('sony playstation 5 pro', 'ps5');
registerAlias('playstation 5 pro', 'ps5');
registerAlias('sony playstation 5', 'ps5');
registerAlias('playstation 5', 'ps5');
registerAlias('playstation 5 standard edition', 'ps5');
registerAlias('ps5 standard', 'ps5');
registerAlias('xbox series x', 'xbox');
registerAlias('nintendo switch oled', 'switch');
registerAlias('switch oled', 'switch');
registerAlias('sony playstation 4 pro', 'ps4');
registerAlias('playstation 4 pro', 'ps4');

console.log(`[AVAILABILITY] Total aliases registered: ${aliasToKey.size}`);

export const resolveRentalConsoleKey = (value?: string | null): string | null => {
  if (!value) return null;

  const normalized = normalizeToken(value);
  if (!normalized) return null;

  const directMatch = aliasToKey.get(normalized);
  if (directMatch) return directMatch;

  // Keyword matching
  if (normalized.includes('ps5') || normalized.includes('playstation 5')) return 'ps5';
  if (normalized.includes('ps4') || normalized.includes('playstation 4')) return 'ps4';
  if (normalized.includes('xbox')) return 'xbox';
  if (normalized.includes('switch') || normalized.includes('nintendo')) return 'switch';
  if (normalized.includes('quest') || normalized.includes('meta') || normalized.includes('vr')) return 'vr';

  return null;
};

const resolveUnitConsoleKey = (unit: InventoryLike) =>
  resolveRentalConsoleKey(unit.productId)
  ?? resolveRentalConsoleKey(unit.consoleId)
  ?? resolveRentalConsoleKey(unit.name)
  ?? resolveRentalConsoleKey(unit.serialNumber);

const resolveRentalRecordConsoleKey = (rental: RentalLike) =>
  resolveRentalConsoleKey(rental.productId)
  ?? resolveRentalConsoleKey(rental.consoleId)
  ?? resolveRentalConsoleKey(rental.productName)
  ?? resolveRentalConsoleKey(rental.consoleName);

const isUnitAvailableStatus = (status?: string) => normalizeToken(status ?? '') === 'available';

const isActiveRentalStatus = (status?: string) => {
  const normalized = normalizeToken(status ?? '');
  return normalized === 'active' || normalized === 'pending';
};

export const filterAvailableUnits = <TUnit extends InventoryLike, TRental extends RentalLike>(
  units: TUnit[],
  rentals: TRental[],
  consoleId: string,
  startDate: Date,
  endDate: Date
) => {
  const requestedKey = resolveRentalConsoleKey(consoleId);
  console.log(`[AVAILABILITY] Requested Key: ${requestedKey} for ConsoleId: ${consoleId}`);

  const relevantUnits = units.filter((unit) => {
    const isStatusOk = isUnitAvailableStatus(unit.status);
    const unitKey = resolveUnitConsoleKey(unit);
    const isKeyMatch = requestedKey ? unitKey === requestedKey : (unit.productId === consoleId || unit.consoleId === consoleId);
    
    if (requestedKey === 'ps5' && unit.name?.includes('PlayStation 5')) {
        console.log(`[AVAILABILITY] Checking unit ${unit.name}: StatusOK=${isStatusOk}, UnitKey=${unitKey}, Match=${isKeyMatch}`);
    }

    return isStatusOk && isKeyMatch;
  });

  console.log(`[AVAILABILITY] Found ${relevantUnits.length} relevant units out of ${units.length}`);

  if (relevantUnits.length === 0) return [];

  const relevantRentals = rentals.filter((rental) => {
    if (!isActiveRentalStatus(rental.status)) return false;
    if (!requestedKey) return rental.productId === consoleId || rental.consoleId === consoleId;
    return resolveRentalRecordConsoleKey(rental) === requestedKey;
  });

  console.log(`[AVAILABILITY] Found ${relevantRentals.length} active rentals potentially overlapping`);

  return relevantUnits.filter((unit) => {
    const unitRentals = relevantRentals.filter((rental) => rental.unitId === unit.id);

    const overlapping = unitRentals.filter((rental) => {
      if (!rental.startDate || !rental.endDate) return false;

      return areIntervalsOverlapping(
        { start: startDate, end: endDate },
        { start: new Date(rental.startDate), end: new Date(rental.endDate) }
      );
    });

    return overlapping.length === 0;
  });
};
