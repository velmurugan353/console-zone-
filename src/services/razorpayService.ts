/// <reference types="vite/client" />
declare const Razorpay: any;

export interface RazorpayOptions {
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    handler: (response: any) => void;
    modal?: {
        ondismiss?: () => void;
    };
    theme?: {
        color?: string;
    };
}

const ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);

class RazorpayService {
    private keyId: string = ENV.VITE_RAZORPAY_KEY_ID || '';

    constructor() { }

    async openCheckout(options: Partial<RazorpayOptions>) {
        // Mock payment if using a dummy key or if Razorpay SDK isn't loaded
        if (this.keyId === 'rzp_test_v008_key' || this.keyId === '' || typeof Razorpay === 'undefined') {
            console.log('[RAZORPAY_MOCK] Simulating successful payment...');
            
            // Show a brief loading simulation
            setTimeout(() => {
                if (options.handler) {
                    options.handler({
                        razorpay_payment_id: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
                        razorpay_order_id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
                        razorpay_signature: `sig_mock_${Math.random().toString(36).substr(2, 9)}`
                    });
                }
            }, 1500);
            
            return;
        }

        const fullOptions = {
            key: this.keyId,
            amount: options.amount || 0,
            currency: options.currency || 'INR',
            name: options.name || 'ConsoleZone',
            description: options.description || 'ConsoleZone Purchase',
            prefill: options.prefill || {},
            handler: options.handler || ((res: any) => console.log('Payment Success:', res)),
            modal: options.modal || {},
            theme: {
                color: "var(--color-gaming-accent)",
                ...options.theme
            }
        };

        const rzp = new Razorpay(fullOptions);
        rzp.open();
    }
}

export const razorpayService = new RazorpayService();

