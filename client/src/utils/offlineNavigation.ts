/**
 * Module for implementing offline navigation
 * 
 * This module provides functionality for:
 * 1. Determining route availability in offline mode
 * 2. Caching and loading data for offline mode
 * 3. Monitoring network status
 */

// NOTE: React hooks have been moved to a separate file for better organization
// and to avoid hook rule violations. See client/src/hooks/useNetworkStatus.tsx

// Global storage for cached data
export const OFFLINE_DATA = {
  products: [] as any[],
  user: null as any
};

// List of routes available in offline mode
export const OFFLINE_ROUTES = [
  '/',                    // Home page
  '/account',             // Account page
  '/offline-test',        // Offline test page
  '/offline-enhanced',    // Enhanced offline page
];

/**
 * Initialize offline navigation module
 */
export function initOfflineNavigation() {
  console.log('[Offline Navigation] Initializing...');
  
  // Load data from localStorage
  loadOfflineData();
  
  // Add network event listeners
  window.addEventListener('online', () => {
    console.log('[Offline Navigation] Connection restored');
    dispatchNetworkEvent(true);
  });
  
  window.addEventListener('offline', () => {
    console.log('[Offline Navigation] Connection lost');
    dispatchNetworkEvent(false);
  });
  
  // Send initial network status event
  dispatchNetworkEvent(navigator.onLine);
  
  return true;
}

/**
 * Checks if a route is available in offline mode
 */
export function isRouteAvailableOffline(route: string): boolean {
  // If the route exactly matches one of the available offline routes
  if (OFFLINE_ROUTES.includes(route)) {
    return true;
  }
  
  // Check routes with parameters
  for (const offlineRoute of OFFLINE_ROUTES) {
    if (offlineRoute.includes(':') && route.startsWith(offlineRoute.split(':')[0])) {
      return true;
    }
  }
  
  // Check if we have cached data for this product
  if (route.startsWith('/product/') && OFFLINE_DATA.products.length > 0) {
    const productId = route.split('/').pop();
    
    // If there is a product ID and it exists in the cache
    if (productId && OFFLINE_DATA.products.some(p => p.id.toString() === productId)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Dispatches an event about network status change
 */
function dispatchNetworkEvent(isOnline: boolean) {
  const event = new CustomEvent('network-status-change', {
    detail: { online: isOnline }
  });
  window.dispatchEvent(event);
  
  // Update document state by adding/removing "offline" class
  if (isOnline) {
    document.documentElement.classList.remove('offline');
  } else {
    document.documentElement.classList.add('offline');
  }
}

// Hook for tracking network status moved to a separate file
// See client/src/hooks/useNetworkStatus.tsx

/**
 * Saves data to localStorage for offline mode
 */
export function saveOfflineData() {
  try {
    // Save data by type separately for more flexible updates
    localStorage.setItem('offline_products', JSON.stringify(OFFLINE_DATA.products));
    
    if (OFFLINE_DATA.user) {
      localStorage.setItem('offline_user', JSON.stringify(OFFLINE_DATA.user));
    }
    
    console.log('[Offline Navigation] Data saved to localStorage');
    return true;
  } catch (error) {
    console.error('[Offline Navigation] Error saving data:', error);
    return false;
  }
}

/**
 * Loads cached data from localStorage
 */
export function loadOfflineData() {
  try {
    // Load product data
    const productsData = localStorage.getItem('offline_products');
    if (productsData) {
      OFFLINE_DATA.products = JSON.parse(productsData);
      console.log(`[Offline Navigation] Loaded ${OFFLINE_DATA.products.length} products from cache`);
    }
    
    // Load user data
    const userData = localStorage.getItem('offline_user');
    if (userData) {
      OFFLINE_DATA.user = JSON.parse(userData);
      console.log(`[Offline Navigation] Loaded user data from cache (${OFFLINE_DATA.user.username})`);
    }
    
    return true;
  } catch (error) {
    console.error('[Offline Navigation] Error loading data:', error);
    return false;
  }
}

/**
 * Caches data for offline mode
 */
export function cacheDataForOffline(dataType: 'products' | 'user', data: any) {
  if (dataType === 'products' && Array.isArray(data)) {
    OFFLINE_DATA.products = data;
    console.log(`[Offline Navigation] Cached ${data.length} products`);
  } else if (dataType === 'user' && data) {
    OFFLINE_DATA.user = data;
    console.log(`[Offline Navigation] Cached user (${data.username})`);
  }
  
  // Save updated data to localStorage
  saveOfflineData();
  
  return true;
}

/**
 * Clears offline data cache
 */
export function clearOfflineData() {
  OFFLINE_DATA.products = [];
  OFFLINE_DATA.user = null;
  
  // Remove data from localStorage
  localStorage.removeItem('offline_products');
  localStorage.removeItem('offline_user');
  
  console.log('[Offline Navigation] Offline data cache cleared');
  
  return true;
}

export default {
  initOfflineNavigation,
  isRouteAvailableOffline,
  // useNetworkStatus moved to dedicated hook file
  saveOfflineData,
  loadOfflineData,
  cacheDataForOffline,
  clearOfflineData,
  OFFLINE_DATA,
  OFFLINE_ROUTES
};