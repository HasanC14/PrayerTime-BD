/**
 * Storage Service
 * Handles all localStorage operations with error handling and fallbacks
 */
import { CACHE_CONFIG } from '../constants/index.js';

class StorageService {
	/**
	 * Generic get method with error handling
	 * @param {string} key - Storage key
	 * @param {*} defaultValue - Default value if key doesn't exist
	 * @returns {*} Stored value or default
	 */
	get(key, defaultValue = null) {
		try {
			const value = localStorage.getItem(key);
			return value ? JSON.parse(value) : defaultValue;
		} catch (error) {
			console.warn(`Error reading from storage (${key}):`, error);
			return defaultValue;
		}
	}

	/**
	 * Generic set method with error handling
	 * @param {string} key - Storage key
	 * @param {*} value - Value to store
	 * @returns {boolean} Success status
	 */
	set(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (error) {
			console.warn(`Error writing to storage (${key}):`, error);
			return false;
		}
	}

	/**
	 * Remove item from storage
	 * @param {string} key - Storage key
	 * @returns {boolean} Success status
	 */
	remove(key) {
		try {
			localStorage.removeItem(key);
			return true;
		} catch (error) {
			console.warn(`Error removing from storage (${key}):`, error);
			return false;
		}
	}

	/**
	 * Check if cached data is still valid
	 * @param {Object} cachedData - Cached data with timestamp
	 * @param {number} duration - Cache duration in milliseconds
	 * @returns {boolean} Whether cache is valid
	 */
	isCacheValid(cachedData, duration = CACHE_CONFIG.DURATION) {
		if (!cachedData || !cachedData.timestamp) return false;
		return Date.now() - cachedData.timestamp < duration;
	}

	/**
	 * Get cached data with validation
	 * @param {string} key - Storage key
	 * @param {number} duration - Cache duration
	 * @returns {*} Valid cached data or null
	 */
	getCached(key, duration = CACHE_CONFIG.DURATION) {
		const cached = this.get(key);
		if (this.isCacheValid(cached, duration)) {
			return cached.data;
		}
		return null;
	}

	/**
	 * Set data with timestamp for caching
	 * @param {string} key - Storage key
	 * @param {*} data - Data to cache
	 * @returns {boolean} Success status
	 */
	setCached(key, data) {
		return this.set(key, {
			data,
			timestamp: Date.now(),
		});
	}

	// Specific methods for different data types
	getPrayerTimesCache() {
		return this.getCached(CACHE_CONFIG.PRAYER_TIMES_KEY);
	}

	setPrayerTimesCache(data) {
		return this.setCached(CACHE_CONFIG.PRAYER_TIMES_KEY, data);
	}

	getLocation() {
		return this.get(CACHE_CONFIG.LOCATION_KEY);
	}

	setLocation(location) {
		return this.set(CACHE_CONFIG.LOCATION_KEY, location);
	}

	getNotificationSettings() {
		return this.get(CACHE_CONFIG.NOTIFICATION_SETTINGS_KEY, {
			enabled: false,
			jamaatNotification: true,
			prayerNotification: false,
			beforeJamaatMinutes: 5,
			beforePrayerMinutes: 10,
		});
	}

	setNotificationSettings(settings) {
		return this.set(CACHE_CONFIG.NOTIFICATION_SETTINGS_KEY, settings);
	}

	getCustomJamaatSettings() {
		return this.get(CACHE_CONFIG.CUSTOM_JAMAAT_SETTINGS_KEY);
	}

	setCustomJamaatSettings(settings) {
		return this.set(CACHE_CONFIG.CUSTOM_JAMAAT_SETTINGS_KEY, settings);
	}

	getJamaatTimesCache() {
		return this.get(CACHE_CONFIG.JAMAAT_TIMES_KEY);
	}

	setJamaatTimesCache(times) {
		return this.set(CACHE_CONFIG.JAMAAT_TIMES_KEY, times);
	}

	/**
	 * Clear all app-related cache
	 */
	clearCache() {
		Object.values(CACHE_CONFIG).forEach((key) => {
			if (typeof key === 'string') {
				this.remove(key);
			}
		});
	}
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
