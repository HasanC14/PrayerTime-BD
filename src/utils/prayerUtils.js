/**
 * Prayer Calculation Utilities
 * Core logic for prayer time calculations and state management
 */
import { PRAYER_CONFIG } from '../constants/index.js';
import { parseTime, addMinutes } from './timeUtils.js';

/**
 * Get next prayer time and current prayer information
 * @param {Date} currentTime - Current time
 * @param {Object} prayerTimes - Prayer times object
 * @returns {Object} Next prayer info and current prayer
 */
export const getNextPrayerTime = (currentTime, prayerTimes) => {
	if (!prayerTimes || !currentTime) {
		return {
			nextPrayerTime: null,
			prayerName: null,
			currentPrayer: null,
		};
	}

	const prayerOrder = PRAYER_CONFIG.ORDER;
	let currentPrayer = null;

	// Find current prayer by checking which prayer window we're in
	for (let i = 0; i < prayerOrder.length; i++) {
		const prayer = prayerOrder[i];
		const nextPrayer = prayerOrder[i + 1] || prayerOrder[0]; // Wrap around to Fajr

		if (prayerTimes[prayer] && prayerTimes[nextPrayer]) {
			const prayerTime = parseTime(prayerTimes[prayer]);
			const nextPrayerTime = parseTime(prayerTimes[nextPrayer]);

			if (!prayerTime || !nextPrayerTime) continue;

			// Handle overnight transition (Isha to Fajr)
			if (prayer === 'Isha') {
				const tomorrowFajr = parseTime(prayerTimes.Fajr);
				if (tomorrowFajr) {
					tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);

					if (
						currentTime >= prayerTime ||
						currentTime < parseTime(prayerTimes.Fajr)
					) {
						currentPrayer = 'Isha';
						break;
					}
				}
			} else {
				// Regular prayer windows
				if (currentTime >= prayerTime && currentTime < nextPrayerTime) {
					currentPrayer = prayer;
					break;
				}
			}
		}
	}

	// Find next prayer
	for (const prayer of prayerOrder) {
		if (prayerTimes[prayer]) {
			const prayerTime = parseTime(prayerTimes[prayer]);
			if (prayerTime && currentTime < prayerTime) {
				return {
					nextPrayerTime: prayerTime,
					prayerName: prayer,
					currentPrayer: currentPrayer,
				};
			}
		}
	}

	// Next prayer is Fajr tomorrow
	const tomorrowFajr = parseTime(prayerTimes.Fajr);
	if (tomorrowFajr) {
		tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
		return {
			nextPrayerTime: tomorrowFajr,
			prayerName: 'Fajr',
			currentPrayer: currentPrayer || 'Isha',
		};
	}

	return {
		nextPrayerTime: null,
		prayerName: null,
		currentPrayer: currentPrayer,
	};
};

/**
 * Calculate Jamaat times based on prayer times and offsets
 * @param {Object} prayerTimes - Prayer times object
 * @param {Object} jamaatOffsets - Offset minutes for each prayer
 * @returns {Object} Calculated Jamaat times
 */
export const calculateJamaatTimes = (prayerTimes, jamaatOffsets) => {
	if (!prayerTimes || !jamaatOffsets) return null;

	const jamaatTimes = {};
	const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

	prayers.forEach((prayer) => {
		if (prayerTimes[prayer] && jamaatOffsets[prayer] !== undefined) {
			const offset = parseInt(jamaatOffsets[prayer], 10);
			if (!isNaN(offset)) {
				jamaatTimes[prayer] = addMinutes(prayerTimes[prayer], offset);
			}
		}
	});

	return jamaatTimes;
};

/**
 * Get next Jamaat time information
 * @param {Date} currentTime - Current time
 * @param {Object} jamaatTimes - Jamaat times object
 * @param {Object} prayerTimes - Prayer times object (for fallback)
 * @returns {Object} Next Jamaat info
 */
export const getNextJamaatTime = (currentTime, jamaatTimes) => {
	if (!jamaatTimes || !currentTime) {
		return {
			nextJamaatTime: null,
			prayerName: null,
			currentJamaat: null,
		};
	}

	const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
	let currentJamaat = null;

	// Find current Jamaat by checking which Jamaat window we're in
	for (let i = 0; i < prayerOrder.length; i++) {
		const prayer = prayerOrder[i];
		const nextPrayer = prayerOrder[i + 1] || prayerOrder[0];

		if (jamaatTimes[prayer] && jamaatTimes[nextPrayer]) {
			const jamaatTime = parseTime(jamaatTimes[prayer]);
			const nextJamaatTime = parseTime(jamaatTimes[nextPrayer]);

			if (!jamaatTime || !nextJamaatTime) continue;

			// Handle overnight transition (Isha to Fajr)
			if (prayer === 'Isha') {
				const tomorrowFajrJamaat = parseTime(jamaatTimes.Fajr);
				if (tomorrowFajrJamaat) {
					tomorrowFajrJamaat.setDate(tomorrowFajrJamaat.getDate() + 1);

					if (
						currentTime >= jamaatTime ||
						currentTime < parseTime(jamaatTimes.Fajr)
					) {
						currentJamaat = 'Isha';
						break;
					}
				}
			} else {
				if (currentTime >= jamaatTime && currentTime < nextJamaatTime) {
					currentJamaat = prayer;
					break;
				}
			}
		}
	}

	// Find next Jamaat
	for (const prayer of prayerOrder) {
		if (jamaatTimes[prayer]) {
			const jamaatTime = parseTime(jamaatTimes[prayer]);
			if (jamaatTime && currentTime < jamaatTime) {
				return {
					nextJamaatTime: jamaatTime,
					prayerName: prayer,
					currentJamaat: currentJamaat,
				};
			}
		}
	}

	// Next Jamaat is Fajr tomorrow
	const tomorrowFajrJamaat = parseTime(jamaatTimes.Fajr);
	if (tomorrowFajrJamaat) {
		tomorrowFajrJamaat.setDate(tomorrowFajrJamaat.getDate() + 1);
		return {
			nextJamaatTime: tomorrowFajrJamaat,
			prayerName: 'Fajr',
			currentJamaat: currentJamaat || 'Isha',
		};
	}

	return {
		nextJamaatTime: null,
		prayerName: null,
		currentJamaat: currentJamaat,
	};
};

/**
 * Get prayer schedule for display
 * @param {Object} prayerTimes - Prayer times object
 * @param {Object} jamaatTimes - Optional Jamaat times
 * @returns {Array} Formatted prayer schedule
 */
export const getPrayerSchedule = (prayerTimes, jamaatTimes = null) => {
	if (!prayerTimes) return [];

	const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

	return prayers
		.map((prayer) => ({
			name: prayer,
			prayerTime: prayerTimes[prayer],
			jamaatTime: jamaatTimes ? jamaatTimes[prayer] : null,
			icon: `/icons/${prayer}.svg`,
		}))
		.filter((prayer) => prayer.prayerTime);
};

/**
 * Get time remaining until next prayer/Jamaat
 * @param {Date} currentTime - Current time
 * @param {Date} targetTime - Target prayer/Jamaat time
 * @returns {number} Time remaining in milliseconds
 */
export const getTimeRemaining = (currentTime, targetTime) => {
	if (!currentTime || !targetTime) return 0;

	const diff = targetTime.getTime() - currentTime.getTime();
	return Math.max(0, diff);
};

/**
 * Check if it's currently prayer time (within prayer window)
 * @param {Date} currentTime - Current time
 * @param {Object} prayerTimes - Prayer times object
 * @param {string} prayerName - Name of the prayer to check
 * @returns {boolean} Whether it's currently the specified prayer time
 */
export const isCurrentPrayerTime = (currentTime, prayerTimes, prayerName) => {
	const { currentPrayer } = getNextPrayerTime(currentTime, prayerTimes);
	return currentPrayer === prayerName;
};

/**
 * Check if it's currently Jamaat time
 * @param {Date} currentTime - Current time
 * @param {Object} jamaatTimes - Jamaat times object
 * @param {string} prayerName - Name of the prayer to check
 * @returns {boolean} Whether it's currently the specified Jamaat time
 */
export const isCurrentJamaatTime = (currentTime, jamaatTimes, prayerName) => {
	const { currentJamaat } = getNextJamaatTime(currentTime, jamaatTimes);
	return currentJamaat === prayerName;
};

/**
 * Validate prayer times object
 * @param {Object} prayerTimes - Prayer times to validate
 * @returns {boolean} Whether prayer times are valid
 */
export const validatePrayerTimes = (prayerTimes) => {
	if (!prayerTimes || typeof prayerTimes !== 'object') return false;

	const requiredPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

	return requiredPrayers.every((prayer) => {
		const time = prayerTimes[prayer];
		if (!time || typeof time !== 'string') return false;

		// Basic time format validation (HH:MM)
		return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
	});
};

/**
 * Get prayer time difference in a human-readable format
 * @param {string} time1 - First time in HH:MM format
 * @param {string} time2 - Second time in HH:MM format
 * @returns {string} Time difference description
 */
export const getPrayerTimeDifference = (time1, time2) => {
	if (!time1 || !time2) return '';

	const date1 = parseTime(time1);
	const date2 = parseTime(time2);

	if (!date1 || !date2) return '';

	const diffMs = Math.abs(date2.getTime() - date1.getTime());
	const diffMinutes = Math.floor(diffMs / (1000 * 60));

	if (diffMinutes < 60) {
		return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
	}

	const hours = Math.floor(diffMinutes / 60);
	const minutes = diffMinutes % 60;

	if (minutes === 0) {
		return `${hours} hour${hours !== 1 ? 's' : ''}`;
	}

	return `${hours}h ${minutes}m`;
};
