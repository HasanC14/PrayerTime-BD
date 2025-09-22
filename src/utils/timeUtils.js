/**
 * Time Utilities
 * Centralized time parsing, formatting, and calculation functions
 */

/**
 * Convert 24-hour time to 12-hour format
 * @param {string} time - Time in HH:MM format
 * @returns {string} Time in 12-hour format
 */
export const convertTo12Hour = (time) => {
	if (!time || typeof time !== 'string') return '';

	try {
		const [hours, minutes] = time.split(':').map(Number);

		if (
			isNaN(hours) ||
			isNaN(minutes) ||
			hours < 0 ||
			hours > 23 ||
			minutes < 0 ||
			minutes > 59
		) {
			return time; // Return original if invalid
		}

		const ampm = hours >= 12 ? 'PM' : 'AM';
		const displayHours = hours % 12 || 12;

		return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
	} catch (error) {
		console.warn('Error converting time format:', error);
		return time;
	}
};

/**
 * Parse time string into Date object for today
 * @param {string} timeString - Time in HH:MM format
 * @returns {Date} Date object with today's date and specified time
 */
export const parseTime = (timeString) => {
	if (!timeString) return null;

	try {
		const [hours, minutes] = timeString.split(':').map(Number);
		const date = new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	} catch (error) {
		console.warn('Error parsing time:', error);
		return null;
	}
};

/**
 * Format duration in milliseconds to readable string
 * @param {number} duration - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration) => {
	if (!duration || duration < 0) return '';

	const totalSeconds = Math.floor(duration / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	}
	return `${seconds}s`;
};

/**
 * Get current time
 * @returns {Date} Current date and time
 */
export const getCurrentTime = () => new Date();

/**
 * Add minutes to a time string
 * @param {string} timeString - Time in HH:MM format
 * @param {number} minutes - Minutes to add
 * @returns {string} New time in HH:MM format
 */
export const addMinutes = (timeString, minutes) => {
	if (!timeString || typeof minutes !== 'number') return timeString;

	try {
		const [hours, mins] = timeString.split(':').map(Number);
		const date = new Date();
		date.setHours(hours, mins + minutes, 0, 0);

		const newHours = date.getHours();
		const newMinutes = date.getMinutes();

		return `${newHours.toString().padStart(2, '0')}:${newMinutes
			.toString()
			.padStart(2, '0')}`;
	} catch (error) {
		console.warn('Error adding minutes to time:', error);
		return timeString;
	}
};

/**
 * Check if current time is between two times
 * @param {Date} currentTime - Current time
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {boolean} Whether current time is in the range
 */
export const isTimeBetween = (currentTime, startTime, endTime) => {
	const start = parseTime(startTime);
	const end = parseTime(endTime);

	if (!start || !end) return false;

	// Handle overnight periods (e.g., Isha to Fajr)
	if (end < start) {
		return currentTime >= start || currentTime < end;
	}

	return currentTime >= start && currentTime < end;
};

/**
 * Calculate time difference in milliseconds
 * @param {Date} time1 - First time
 * @param {Date} time2 - Second time
 * @returns {number} Difference in milliseconds
 */
export const timeDifference = (time1, time2) => {
	if (!time1 || !time2) return 0;
	return Math.abs(time2.getTime() - time1.getTime());
};

/**
 * Format time for display (removes seconds if present)
 * @param {string} timeString - Time string
 * @returns {string} Formatted time string
 */
export const formatTimeDisplay = (timeString) => {
	if (!timeString) return '';

	// Remove seconds if present (HH:MM:SS -> HH:MM)
	const parts = timeString.split(':');
	if (parts.length > 2) {
		return parts.slice(0, 2).join(':');
	}

	return timeString;
};

/**
 * Get relative time description
 * @param {number} milliseconds - Time difference in milliseconds
 * @returns {string} Relative time description
 */
export const getRelativeTime = (milliseconds) => {
	if (milliseconds < 0) return 'now';

	const minutes = Math.floor(milliseconds / (1000 * 60));
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
	if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
	if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;

	return 'now';
};

/**
 * Check if a time is today
 * @param {Date} date - Date to check
 * @returns {boolean} Whether the date is today
 */
export const isToday = (date) => {
	if (!date) return false;

	const today = new Date();
	return date.toDateString() === today.toDateString();
};

/**
 * Get formatted date string
 * @param {Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
	if (!date) return '';

	const defaultOptions = {
		weekday: 'short',
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	};

	try {
		return new Intl.DateTimeFormat('en-US', {
			...defaultOptions,
			...options,
		}).format(date);
	} catch (error) {
		console.warn('Error formatting date:', error);
		return date.toLocaleDateString();
	}
};
