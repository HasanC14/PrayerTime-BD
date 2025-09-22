/**
 * Prayer Timer Hook
 * Custom hook for managing prayer and Jamaat time countdowns
 */
import { useState, useEffect, useCallback } from 'react';
import { getCurrentTime } from '../utils/timeUtils.js';
import {
	getNextPrayerTime,
	getNextJamaatTime,
	getTimeRemaining,
} from '../utils/prayerUtils.js';

export const usePrayerTimer = (prayerTimes, jamaatTimes = null) => {
	const [currentPrayer, setCurrentPrayer] = useState(null);
	const [nextPrayer, setNextPrayer] = useState(null);
	const [nextPrayerTime, setNextPrayerTime] = useState(null);
	const [prayerTimeRemaining, setPrayerTimeRemaining] = useState(0);

	const [currentJamaat, setCurrentJamaat] = useState(null);
	const [nextJamaat, setNextJamaat] = useState(null);
	const [nextJamaatTime, setNextJamaatTime] = useState(null);
	const [jamaatTimeRemaining, setJamaatTimeRemaining] = useState(0);

	const updateTimers = useCallback(() => {
		const now = getCurrentTime();

		// Update prayer timer
		if (prayerTimes) {
			const prayerInfo = getNextPrayerTime(now, prayerTimes);
			setCurrentPrayer(prayerInfo.currentPrayer);
			setNextPrayer(prayerInfo.prayerName);
			setNextPrayerTime(prayerInfo.nextPrayerTime);

			if (prayerInfo.nextPrayerTime) {
				const remaining = getTimeRemaining(now, prayerInfo.nextPrayerTime);
				setPrayerTimeRemaining(remaining);
			}
		}

		// Update Jamaat timer
		if (jamaatTimes) {
			const jamaatInfo = getNextJamaatTime(now, jamaatTimes);
			setCurrentJamaat(jamaatInfo.currentJamaat);
			setNextJamaat(jamaatInfo.prayerName);
			setNextJamaatTime(jamaatInfo.nextJamaatTime);

			if (jamaatInfo.nextJamaatTime) {
				const remaining = getTimeRemaining(now, jamaatInfo.nextJamaatTime);
				setJamaatTimeRemaining(remaining);
			}
		}
	}, [prayerTimes, jamaatTimes]);

	// Update timers every second
	useEffect(() => {
		updateTimers(); // Initial update

		const interval = setInterval(updateTimers, 1000);

		return () => clearInterval(interval);
	}, [updateTimers]);

	// Reset timers when prayer/Jamaat times change
	useEffect(() => {
		updateTimers();
	}, [prayerTimes, jamaatTimes, updateTimers]);

	return {
		// Prayer timer data
		currentPrayer,
		nextPrayer,
		nextPrayerTime,
		prayerTimeRemaining,

		// Jamaat timer data
		currentJamaat,
		nextJamaat,
		nextJamaatTime,
		jamaatTimeRemaining,

		// Manual update function
		updateTimers,
	};
};
