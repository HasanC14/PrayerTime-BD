/**
 * Prayer Times Hook
 * Custom hook for managing prayer times state and API calls
 */
import { useState, useEffect, useCallback } from 'react';
import { prayerTimesService } from '../services/prayerTimesService.js';
import { validatePrayerTimes } from '../utils/prayerUtils.js';

export const usePrayerTimes = (location) => {
	const [prayerTimes, setPrayerTimes] = useState(null);
	const [hijriDate, setHijriDate] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isOffline, setIsOffline] = useState(false);

	const fetchPrayerTimes = useCallback(async () => {
		if (!location) return;

		setIsLoading(true);
		setError(null);

		try {
			const result = await prayerTimesService.fetchPrayerTimes(location);

			if (result.success) {
				const { timings, hijriDate: hijri } = result.data;

				// Validate prayer times before setting
				if (validatePrayerTimes(timings)) {
					setPrayerTimes(timings);
					setHijriDate(hijri);
					setIsOffline(result.offline || false);
					setError(null);
				} else {
					throw new Error('Invalid prayer times received from API');
				}
			} else {
				throw new Error(result.error || 'Failed to fetch prayer times');
			}
		} catch (err) {
			console.error('Prayer times fetch error:', err);
			setError(err.message);
			setIsOffline(true);
		} finally {
			setIsLoading(false);
		}
	}, [location]);

	// Auto-fetch when location changes
	useEffect(() => {
		if (location) {
			fetchPrayerTimes();
		}
	}, [location, fetchPrayerTimes]);

	// Network status monitoring
	useEffect(() => {
		const handleOnline = () => {
			setIsOffline(false);
			if (location && error) {
				fetchPrayerTimes(); // Retry when back online
			}
		};

		const handleOffline = () => setIsOffline(true);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [location, error, fetchPrayerTimes]);

	const retry = useCallback(() => {
		fetchPrayerTimes();
	}, [fetchPrayerTimes]);

	return {
		prayerTimes,
		hijriDate,
		isLoading,
		error,
		isOffline,
		retry,
		refetch: fetchPrayerTimes,
	};
};
