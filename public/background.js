// Background service worker for PrayerTime BD Chrome Extension
// Handles notifications and alarm scheduling
/* global chrome */

// Storage keys
const STORAGE_KEYS = {
	PRAYER_TIMES: 'prayerTimesCache',
	JAMAAT_TIMES: 'jamaatTimesCache',
	SELECTED_MOSQUE: 'selectedMosqueCache',
	NOTIFICATION_SETTINGS: 'notificationSettings',
	LAST_NOTIFICATION_DATE: 'lastNotificationDate',
};

// Install event - set up initial state
chrome.runtime.onInstalled.addListener(() => {
	console.log('PrayerTime BD Extension installed');
	setupInitialAlarms();
});

// Set up daily alarms for prayer and jamaat notifications
async function setupInitialAlarms() {
	try {
		// Clear existing alarms
		await chrome.alarms.clearAll();

		// Set up daily alarm to schedule prayer/jamaat notifications
		await chrome.alarms.create('dailySchedule', {
			when: Date.now() + 1000, // Start in 1 second
			periodInMinutes: 60, // Check every hour
		});

		console.log('Initial alarms set up');
	} catch (error) {
		console.error('Error setting up initial alarms:', error);
	}
}

// Handle alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
	console.log('Alarm triggered:', alarm.name);

	if (alarm.name === 'dailySchedule') {
		await scheduleTodaysNotifications();
	} else if (alarm.name.startsWith('prayer_')) {
		await handlePrayerNotification(alarm.name);
	} else if (alarm.name.startsWith('jamaat_')) {
		await handleJamaatNotification(alarm.name);
	}
});

// Schedule today's prayer and jamaat notifications
async function scheduleTodaysNotifications() {
	try {
		const settings = await getNotificationSettings();
		if (!settings.enabled) {
			console.log('Notifications disabled');
			return;
		}

		const today = new Date().toDateString();
		const lastNotificationDate = await chrome.storage.local.get(
			STORAGE_KEYS.LAST_NOTIFICATION_DATE
		);

		// Check if we already scheduled notifications for today
		if (lastNotificationDate[STORAGE_KEYS.LAST_NOTIFICATION_DATE] === today) {
			console.log('Notifications already scheduled for today');
			return;
		}

		const prayerTimes = await getPrayerTimesFromStorage();
		const jamaatTimes = await getJamaatTimesFromStorage();
		const selectedMosque = await getSelectedMosqueFromStorage();

		if (!prayerTimes) {
			console.log('No prayer times available');
			return;
		}

		// Clear existing prayer/jamaat alarms
		const existingAlarms = await chrome.alarms.getAll();
		for (const alarm of existingAlarms) {
			if (
				alarm.name.startsWith('prayer_') ||
				alarm.name.startsWith('jamaat_')
			) {
				await chrome.alarms.clear(alarm.name);
			}
		}

		// Schedule prayer notifications
		if (settings.prayerNotification) {
			await schedulePrayerNotifications(
				prayerTimes,
				settings.beforePrayerMinutes
			);
		}

		// Schedule jamaat notifications
		if (settings.jamaatNotification && jamaatTimes && selectedMosque) {
			await scheduleJamaatNotifications(
				jamaatTimes,
				selectedMosque,
				settings.beforeJamaatMinutes
			);
		}

		// Mark today as scheduled
		await chrome.storage.local.set({
			[STORAGE_KEYS.LAST_NOTIFICATION_DATE]: today,
		});

		console.log('Notifications scheduled for today');
	} catch (error) {
		console.error('Error scheduling notifications:', error);
	}
}

// Schedule prayer notifications
async function schedulePrayerNotifications(prayerTimes, beforeMinutes) {
	const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
	const today = new Date();

	for (const prayer of prayers) {
		if (prayerTimes[prayer]) {
			const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
			const prayerTime = new Date(today);
			prayerTime.setHours(hours, minutes - beforeMinutes, 0, 0);

			// Only schedule if the time is in the future
			if (prayerTime > new Date()) {
				await chrome.alarms.create(`prayer_${prayer}`, {
					when: prayerTime.getTime(),
				});
				console.log(
					`Scheduled prayer notification for ${prayer} at ${prayerTime}`
				);
			}
		}
	}
}

// Schedule jamaat notifications
async function scheduleJamaatNotifications(jamaatTimes, mosque, beforeMinutes) {
	const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
	const today = new Date();

	for (const prayer of prayers) {
		if (jamaatTimes[prayer]) {
			const [hours, minutes] = jamaatTimes[prayer].split(':').map(Number);
			const jamaatTime = new Date(today);
			jamaatTime.setHours(hours, minutes - beforeMinutes, 0, 0);

			// Only schedule if the time is in the future
			if (jamaatTime > new Date()) {
				await chrome.alarms.create(`jamaat_${prayer}`, {
					when: jamaatTime.getTime(),
				});
				console.log(
					`Scheduled jamaat notification for ${prayer} at ${jamaatTime} (${mosque.name})`
				);
			}
		}
	}
}

// Handle prayer notification
async function handlePrayerNotification(alarmName) {
	const prayer = alarmName.replace('prayer_', '');
	const settings = await getNotificationSettings();

	await chrome.notifications.create(`prayer_${prayer}_${Date.now()}`, {
		type: 'basic',
		iconUrl: 'logo192.png',
		title: '🕌 Prayer Time Reminder',
		message: `${prayer} prayer time is in ${settings.beforePrayerMinutes} minutes`,
		priority: 2,
	});

	console.log(`Prayer notification sent for ${prayer}`);
}

// Handle jamaat notification
async function handleJamaatNotification(alarmName) {
	const prayer = alarmName.replace('jamaat_', '');
	const settings = await getNotificationSettings();
	const mosque = await getSelectedMosqueFromStorage();

	await chrome.notifications.create(`jamaat_${prayer}_${Date.now()}`, {
		type: 'basic',
		iconUrl: 'logo192.png',
		title: '🕌 Jamaat Time Reminder',
		message: `${prayer} Jamaat starts in ${
			settings.beforeJamaatMinutes
		} minutes at ${mosque?.name || 'selected mosque'}`,
		priority: 2,
	});

	console.log(`Jamaat notification sent for ${prayer} at ${mosque?.name}`);
}

// Helper functions to get data from storage
async function getNotificationSettings() {
	try {
		const result = await chrome.storage.local.get(
			STORAGE_KEYS.NOTIFICATION_SETTINGS
		);
		return (
			result[STORAGE_KEYS.NOTIFICATION_SETTINGS] || {
				enabled: false,
				jamaatNotification: true,
				prayerNotification: false,
				beforeJamaatMinutes: 5,
				beforePrayerMinutes: 10,
			}
		);
	} catch (error) {
		console.error('Error getting notification settings:', error);
		return {
			enabled: false,
			jamaatNotification: true,
			prayerNotification: false,
			beforeJamaatMinutes: 5,
			beforePrayerMinutes: 10,
		};
	}
}

async function getPrayerTimesFromStorage() {
	try {
		const result = await chrome.storage.local.get(STORAGE_KEYS.PRAYER_TIMES);
		const cached = result[STORAGE_KEYS.PRAYER_TIMES];
		if (cached) {
			const parsed = JSON.parse(cached);
			// Check if cache is still valid (24 hours)
			const now = Date.now();
			if (parsed.timestamp && now - parsed.timestamp < 24 * 60 * 60 * 1000) {
				return parsed.data.timings;
			}
		}
		return null;
	} catch (error) {
		console.error('Error getting prayer times from storage:', error);
		return null;
	}
}

async function getJamaatTimesFromStorage() {
	try {
		const result = await chrome.storage.local.get(STORAGE_KEYS.JAMAAT_TIMES);
		return result[STORAGE_KEYS.JAMAAT_TIMES] || null;
	} catch (error) {
		console.error('Error getting jamaat times from storage:', error);
		return null;
	}
}

async function getSelectedMosqueFromStorage() {
	try {
		const result = await chrome.storage.local.get(STORAGE_KEYS.SELECTED_MOSQUE);
		return result[STORAGE_KEYS.SELECTED_MOSQUE]
			? JSON.parse(result[STORAGE_KEYS.SELECTED_MOSQUE])
			: null;
	} catch (error) {
		console.error('Error getting selected mosque from storage:', error);
		return null;
	}
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
	console.log('Notification clicked:', notificationId);
	// Clear the notification
	chrome.notifications.clear(notificationId);

	// Open the extension popup (if possible) or focus the extension
	chrome.action.openPopup().catch(() => {
		console.log('Could not open popup automatically');
	});
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'updateNotificationSettings') {
		scheduleTodaysNotifications()
			.then(() => {
				sendResponse({ success: true });
			})
			.catch((error) => {
				console.error('Error updating notification settings:', error);
				sendResponse({ success: false, error: error.message });
			});
		return true; // Keep message port open for async response
	}

	if (request.action === 'testNotification') {
		chrome.notifications
			.create(`test_${Date.now()}`, {
				type: 'basic',
				iconUrl: 'logo192.png',
				title: '🕌 PrayerTime BD Test',
				message: 'Notification system is working correctly!',
				priority: 1,
			})
			.then(() => {
				sendResponse({ success: true });
			})
			.catch((error) => {
				sendResponse({ success: false, error: error.message });
			});
		return true;
	}
});

console.log('Background service worker loaded');
