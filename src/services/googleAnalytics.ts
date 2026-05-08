// Google Analytics 4 Service - Custom Event Tracking for ConsoleZone

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize GA4 (call this once when app loads)
export const initGA = (measurementId: string) => {
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    custom_map: {
      dimension1: 'user_role',
      dimension2: 'console_type',
      dimension3: 'rental_duration',
      metric1: 'rental_value'
    }
  });

  console.log(`[GA4] Initialized with measurement ID: ${measurementId}`);
};

// Page View Tracking
export const trackPageView = (pagePath: string, pageTitle: string) => {
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href
  });
};

// User Role Tracking
export const trackUserRole = (role: 'user' | 'admin' | 'guest') => {
  window.gtag('set', 'user_properties', {
    user_role: role
  });
};

// =================== E-COMMERCE EVENTS ===================

// Product View (Console Details Page)
export const trackProductView = (productName: string, productType: string, price: number) => {
  window.gtag('event', 'view_item', {
    currency: 'INR',
    value: price,
    items: [{
      item_id: productType.toLowerCase().replace(/\s/g, '_'),
      item_name: productName,
      item_category: 'Console Rental',
      price: price
    }]
  });
};

// Add to Cart
export const trackAddToCart = (productName: string, productType: string, price: number, quantity: number = 1) => {
  window.gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: price * quantity,
    items: [{
      item_id: productType.toLowerCase().replace(/\s/g, '_'),
      item_name: productName,
      item_category: 'Console Rental',
      price: price,
      quantity: quantity
    }]
  });
};

// Purchase (Order Completed)
export const trackPurchase = (orderId: string, totalValue: number, items: any[]) => {
  window.gtag('event', 'purchase', {
    transaction_id: orderId,
    value: totalValue,
    currency: 'INR',
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity
    }))
  });
};

// =================== RENTAL EVENTS ===================

// Rental Booking Started
export const trackRentalBookingStart = (consoleName: string, consoleType: string) => {
  window.gtag('event', 'rental_booking_start', {
    console_name: consoleName,
    console_type: consoleType,
    event_category: 'rental'
  });
};

// Rental Booking Completed
export const trackRentalBookingComplete = (
  rentalId: string,
  consoleName: string,
  consoleType: string,
  duration: number,
  totalValue: number,
  deposit: number
) => {
  window.gtag('event', 'rental_booking_complete', {
    rental_id: rentalId,
    console_name: consoleName,
    console_type: consoleType,
    rental_duration_days: duration,
    value: totalValue,
    deposit: deposit,
    currency: 'INR',
    event_category: 'rental'
  });
};

// Rental Check-Out
export const trackRentalCheckout = (rentalId: string, consoleName: string, unitId: string) => {
  window.gtag('event', 'rental_checkout', {
    rental_id: rentalId,
    console_name: consoleName,
    unit_id: unitId,
    event_category: 'rental'
  });
};

// Rental Check-In
export const trackRentalCheckin = (rentalId: string, consoleName: string, condition: string, lateFee: number) => {
  window.gtag('event', 'rental_checkin', {
    rental_id: rentalId,
    console_name: consoleName,
    return_condition: condition,
    late_fee: lateFee,
    event_category: 'rental'
  });
};

// Rental Cancelled
export const trackRentalCancel = (rentalId: string, consoleName: string, reason: string) => {
  window.gtag('event', 'rental_cancel', {
    rental_id: rentalId,
    console_name: consoleName,
    cancellation_reason: reason,
    event_category: 'rental'
  });
};

// =================== KYC EVENTS ===================

// KYC Started
export const trackKYCStart = () => {
  window.gtag('event', 'kyc_started', {
    event_category: 'kyc'
  });
};

// KYC Completed
export const trackKYCComplete = (userId: string, status: string) => {
  window.gtag('event', 'kyc_completed', {
    user_id: userId,
    kyc_status: status,
    event_category: 'kyc'
  });
};

// =================== USER ENGAGEMENT EVENTS ===================

// Search
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  window.gtag('event', 'search', {
    search_term: searchTerm,
    search_results: resultsCount,
    event_category: 'engagement'
  });
};

// Filter Used
export const trackFilter = (filterType: string, filterValue: string) => {
  window.gtag('event', 'filter_used', {
    filter_type: filterType,
    filter_value: filterValue,
    event_category: 'engagement'
  });
};

// Video Play (Tutorial/Demo)
export const trackVideoPlay = (videoTitle: string) => {
  window.gtag('event', 'video_start', {
    video_title: videoTitle,
    event_category: 'engagement'
  });
};

// File Download
export const trackFileDownload = (fileName: string, fileType: string) => {
  window.gtag('event', 'file_download', {
    file_name: fileName,
    file_type: fileType,
    event_category: 'engagement'
  });
};

// Social Share
export const trackSocialShare = (platform: string, contentType: string) => {
  window.gtag('event', 'share', {
    method: platform,
    content_type: contentType,
    event_category: 'engagement'
  });
};

// =================== ERROR TRACKING ===================

// Error Event
export const trackError = (errorDescription: string, errorType: string, fatal: boolean = false) => {
  window.gtag('event', 'exception', {
    description: errorDescription,
    fatal: fatal,
    error_type: errorType
  });
};

// =================== TIMING EVENTS ===================

// Page Load Time
export const trackPageLoadTime = (loadTime: number) => {
  window.gtag('event', 'timing_complete', {
    name: 'page_load',
    value: loadTime,
    event_category: 'performance'
  });
};

// API Response Time
export const trackAPIResponseTime = (endpoint: string, responseTime: number) => {
  window.gtag('event', 'timing_complete', {
    name: 'api_response',
    value: responseTime,
    event_category: 'performance',
    endpoint: endpoint
  });
};

// Export all tracking functions as a single object for easy import
export const ga = {
  init: initGA,
  trackPageView,
  trackUserRole,
  trackProductView,
  trackAddToCart,
  trackPurchase,
  trackRentalBookingStart,
  trackRentalBookingComplete,
  trackRentalCheckout,
  trackRentalCheckin,
  trackRentalCancel,
  trackKYCStart,
  trackKYCComplete,
  trackSearch,
  trackFilter,
  trackVideoPlay,
  trackFileDownload,
  trackSocialShare,
  trackError,
  trackPageLoadTime,
  trackAPIResponseTime
};
