/**
 * Local Storage Hook
 * Custom hook for managing localStorage with type safety and error handling
 */
import { useState, useEffect, useCallback } from 'react';
import storageService from '../services/storageService.js';

export const useLocalStorage = (key, defaultValue = null) => {
	const [value, setValue] = useState(() => {
		return storageService.get(key, defaultValue);
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const setStoredValue = useCallback(
		(newValue) => {
			try {
				setIsLoading(true);
				setError(null);

				// Allow value to be a function so we have the same API as useState
				const valueToStore =
					newValue instanceof Function ? newValue(value) : newValue;

				setValue(valueToStore);
				const success = storageService.set(key, valueToStore);

				if (!success) {
					throw new Error('Failed to save to localStorage');
				}
			} catch (err) {
				console.error(`Error setting localStorage key "${key}":`, err);
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		},
		[key, value]
	);

	const removeStoredValue = useCallback(() => {
		try {
			setIsLoading(true);
			setError(null);

			const success = storageService.remove(key);
			if (success) {
				setValue(defaultValue);
			} else {
				throw new Error('Failed to remove from localStorage');
			}
		} catch (err) {
			console.error(`Error removing localStorage key "${key}":`, err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [key, defaultValue]);

	// Listen for storage changes from other tabs
	useEffect(() => {
		const handleStorageChange = (e) => {
			if (e.key === key && e.newValue !== null) {
				try {
					setValue(JSON.parse(e.newValue));
				} catch (err) {
					console.warn('Error parsing storage change:', err);
				}
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, [key]);

	return {
		value,
		setValue: setStoredValue,
		removeValue: removeStoredValue,
		isLoading,
		error,
	};
};

// Specialized hooks for common storage patterns
export const useLocationStorage = () => {
	return useLocalStorage('selectedLocationCache');
};

export const useNotificationSettings = () => {
	return useLocalStorage('notificationSettings', {
		enabled: false,
		jamaatNotification: true,
		prayerNotification: false,
		beforeJamaatMinutes: 5,
		beforePrayerMinutes: 10,
	});
};

export const useJamaatSettings = () => {
	return useLocalStorage('customJamaatSettings');
};
