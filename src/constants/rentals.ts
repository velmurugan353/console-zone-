export interface RentalConsole {
  id: string;
  name: string;
  slug: string;
  image: string;
  available: number;
  dailyRate: number;
  deposit: number;
  specs: string[];
  included: string[];
  condition: 'Excellent' | 'Good';
}

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  maxBookings: number;
}

export const BOOKING_TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', label: 'Morning', startTime: '10:00', endTime: '12:00', maxBookings: 3 },
  { id: 'midday', label: 'Midday', startTime: '12:00', endTime: '14:00', maxBookings: 3 },
  { id: 'afternoon', label: 'Afternoon', startTime: '14:00', endTime: '16:00', maxBookings: 3 },
  { id: 'late-afternoon', label: 'Late Afternoon', startTime: '16:00', endTime: '18:00', maxBookings: 3 },
  { id: 'evening', label: 'Evening', startTime: '18:00', endTime: '20:00', maxBookings: 3 },
];

export const PICKUP_SLOTS = BOOKING_TIME_SLOTS;
export const RETURN_SLOTS = BOOKING_TIME_SLOTS;

export const RENTAL_CONSOLES: RentalConsole[] = [
  {
    id: 'ps5',
    name: 'PlayStation 5 Standard Edition',
    slug: 'ps5-standard',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=2000',
    available: 12,
    dailyRate: 500,
    deposit: 5000,
    specs: ['4K 120Hz Gaming', '825GB SSD', 'Ray Tracing'],
    included: ['Console', 'DualSense Controller', 'HDMI 2.1 Cable', 'Power Cable'],
    condition: 'Excellent'
  },
  {
    id: 'xbox',
    name: 'Xbox Series X',
    slug: 'xbox-series-x',
    image: 'https://images.unsplash.com/photo-1621259182902-3b836c824e22?auto=format&fit=crop&q=80&w=2000',
    available: 8,
    dailyRate: 450,
    deposit: 4500,
    specs: ['4K 120Hz Gaming', '1TB SSD', 'Quick Resume'],
    included: ['Console', 'Wireless Controller', 'Ultra High Speed HDMI', 'Power Cable'],
    condition: 'Excellent'
  },
  {
    id: 'switch',
    name: 'Nintendo Switch OLED',
    slug: 'nintendo-switch-oled',
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=2000',
    available: 15,
    dailyRate: 350,
    deposit: 3500,
    specs: ['7-inch OLED Screen', '64GB Storage', 'Enhanced Audio'],
    included: ['Console', 'Joy-Con (L/R)', 'Switch Dock', 'HDMI Cable', 'AC Adapter'],
    condition: 'Excellent'
  },
  {
    id: 'ps4',
    name: 'PlayStation 4 Pro',
    slug: 'ps4-pro',
    image: 'https://images.unsplash.com/photo-1507457379470-08b800bebc6b?auto=format&fit=crop&q=80&w=2000',
    available: 5,
    dailyRate: 300,
    deposit: 3000,
    specs: ['4K Gaming (Upscaled)', '1TB HDD', 'HDR Support'],
    included: ['Console', 'DualShock 4 Controller', 'HDMI Cable', 'Power Cable'],
    condition: 'Good'
  }
];
