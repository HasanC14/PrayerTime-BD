/**
 * Prayer Times API Service
 * Handles all API calls for prayer times with error handling and caching
 */
import { PRAYER_CONFIG } from '../constants/index.js';
import storageService from './storageService.js';

class PrayerTimesService {
	constructor() {
		this.baseUrl = PRAYER_CONFIG.API_BASE_URL;
		this.method = PRAYER_CONFIG.API_METHOD;
	}

	/**
	 * Fetch prayer times for a specific location
	 * @param {Object} location - Location object with lat, lng
	 * @param {number} timestamp - Optional timestamp, defaults to now
	 * @returns {Promise<Object>} Prayer times and Hijri date
	 */
	async fetchPrayerTimes(location, timestamp = Math.floor(Date.now() / 1000)) {
		try {
			// Check cache first
			const cachedData = storageService.getPrayerTimesCache();
			if (cachedData) {
				return {
					success: true,
					data: cachedData,
					fromCache: true,
				};
			}

			// Fetch from API
			const url = `${this.baseUrl}/timings/${timestamp}?latitude=${location.lat}&longitude=${location.lng}&method=${this.method}`;

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			if (data.code !== 200) {
				throw new Error(`API Error: ${data.status || 'Unknown error'}`);
			}

			// Process and structure the data
			const processedData = this.processApiResponse(data);

			// Cache the processed data
			storageService.setPrayerTimesCache(processedData);

			return {
				success: true,
				data: processedData,
				fromCache: false,
			};
		} catch (error) {
			console.error('Error fetching prayer times:', error);

			// Try to use cached data even if expired
			const cachedData = storageService.getPrayerTimesCache();
			if (cachedData) {
				return {
					success: true,
					data: cachedData,
					fromCache: true,
					offline: true,
					error: error.message,
				};
			}

			return {
				success: false,
				error: error.message,
				data: null,
			};
		}
	}

	/**
	 * Process API response into standardized format
	 * @param {Object} apiData - Raw API response
	 * @returns {Object} Processed prayer times data
	 */
	processApiResponse(apiData) {
		const timings = apiData.data.timings;
		const hijriDate = apiData.data.date.hijri;

		return {
			timings: {
				Fajr: timings.Fajr,
				Sunrise: timings.Sunrise,
				Dhuhr: timings.Dhuhr,
				Asr: timings.Asr,
				Maghrib: timings.Maghrib,
				Isha: timings.Isha,
			},
			hijriDate: {
				day: hijriDate.day,
				month: hijriDate.month.en,
				year: hijriDate.year,
				abbreviated: hijriDate.designation.abbreviated,
				weekday: hijriDate.weekday.en,
			},
			gregorianDate: {
				readable: apiData.data.date.readable,
				timestamp: apiData.data.date.timestamp,
			},
			meta: {
				latitude: apiData.data.meta.latitude,
				longitude: apiData.data.meta.longitude,
				timezone: apiData.data.meta.timezone,
				method: apiData.data.meta.method,
				fetchedAt: new Date().toISOString(),
			},
		};
	}

	/**
	 * Get multiple days of prayer times
	 * @param {Object} location - Location object
	 * @param {number} days - Number of days to fetch (default 7)
	 * @returns {Promise<Array>} Array of prayer times for multiple days
	 */
	async fetchMultiDayPrayerTimes(location, days = 7) {
		try {
			const promises = [];
			const today = new Date();

			for (let i = 0; i < days; i++) {
				const date = new Date(today);
				date.setDate(today.getDate() + i);
				const timestamp = Math.floor(date.getTime() / 1000);
				promises.push(this.fetchPrayerTimes(location, timestamp));
			}

			const results = await Promise.all(promises);
			return results
				.filter((result) => result.success)
				.map((result) => result.data);
		} catch (error) {
			console.error('Error fetching multi-day prayer times:', error);
			return [];
		}
	}

	/**
	 * Clear cached prayer times
	 */
	clearCache() {
		storageService.remove('prayerTimesCache');
	}
}

// Export singleton instance
export const prayerTimesService = new PrayerTimesService();
export default prayerTimesService;
