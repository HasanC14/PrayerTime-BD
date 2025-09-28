import { useState, useEffect, useRef } from 'react';
import { FaMosque, FaTimes, FaCog } from 'react-icons/fa';
import { setCustomJamaatSettings } from '../utils/helpers';

const CustomJamaatSettings = ({
	isOpen,
	onClose,
	onSave,
	initialOffsets,
	prayerTimes,
	selectedPrayer = null, // New prop for individual prayer editing
}) => {
	const [jamaatTimes, setJamaatTimes] = useState({
		Fajr: '',
		Dhuhr: '',
		Asr: '',
		Maghrib: '',
		Isha: '',
	});

	const isInitialized = useRef(false);

	// Convert prayer times and offsets to actual jamaat times only on initial load
	useEffect(() => {
		if (isInitialized.current) return; // Prevent re-initialization

		if (prayerTimes && initialOffsets) {
			const calculatedJamaatTimes = {};
			Object.entries(initialOffsets).forEach(([prayer, offset]) => {
				if (prayerTimes[prayer]) {
					const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
					const date = new Date();
					date.setHours(hours, minutes + offset, 0, 0);
					const jamaatHours = date.getHours();
					const jamaatMinutes = date.getMinutes();
					calculatedJamaatTimes[prayer] = `${jamaatHours
						.toString()
						.padStart(2, '0')}:${jamaatMinutes.toString().padStart(2, '0')}`;
				}
			});
			setJamaatTimes(calculatedJamaatTimes);
			isInitialized.current = true;
		} else if (prayerTimes && !initialOffsets) {
			// Set default jamaat times only if no times are set
			const defaultOffsets = {
				Fajr: 10,
				Dhuhr: 15,
				Asr: 10,
				Maghrib: 5,
				Isha: 15,
			};
			const defaultJamaatTimes = {};
			Object.entries(defaultOffsets).forEach(([prayer, offset]) => {
				if (prayerTimes[prayer]) {
					const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
					const date = new Date();
					date.setHours(hours, minutes + offset, 0, 0);
					const jamaatHours = date.getHours();
					const jamaatMinutes = date.getMinutes();
					defaultJamaatTimes[prayer] = `${jamaatHours
						.toString()
						.padStart(2, '0')}:${jamaatMinutes.toString().padStart(2, '0')}`;
				}
			});
			setJamaatTimes(defaultJamaatTimes);
			isInitialized.current = true;
		}
	}, [prayerTimes, initialOffsets]);

	// Reset initialization when modal opens
	useEffect(() => {
		if (isOpen && !isInitialized.current) {
			// Modal opened, allow initialization
		} else if (!isOpen) {
			// Modal closed, reset for next time
			isInitialized.current = false;
		}
	}, [isOpen]);

	const handleTimeChange = (prayer, timeValue) => {
		setJamaatTimes((prev) => ({
			...prev,
			[prayer]: timeValue,
		}));
	};

	const handleSave = async () => {
		// Convert jamaat times back to offsets for storage
		const offsets = {};
		Object.entries(jamaatTimes).forEach(([prayer, jamaatTime]) => {
			if (prayerTimes[prayer] && jamaatTime) {
				const [prayerHours, prayerMinutes] = prayerTimes[prayer]
					.split(':')
					.map(Number);
				const [jamaatHours, jamaatMinutes] = jamaatTime.split(':').map(Number);

				const prayerDate = new Date();
				prayerDate.setHours(prayerHours, prayerMinutes, 0, 0);

				const jamaatDate = new Date();
				jamaatDate.setHours(jamaatHours, jamaatMinutes, 0, 0);

				// Handle day boundary crossing
				if (jamaatDate < prayerDate) {
					jamaatDate.setDate(jamaatDate.getDate() + 1);
				}

				const offsetMinutes = Math.round(
					(jamaatDate - prayerDate) / (1000 * 60)
				);
				offsets[prayer] = Math.max(0, Math.min(120, offsetMinutes)); // Limit to 0-120 minutes
			}
		});

		// Save to localStorage
		await setCustomJamaatSettings(offsets);

		// Call parent save handler
		onSave(offsets);

		// Close modal
		onClose();
	};

	const handleCancel = () => {
		// Reset to initial values
		if (prayerTimes && initialOffsets) {
			const calculatedJamaatTimes = {};
			Object.entries(initialOffsets).forEach(([prayer, offset]) => {
				if (prayerTimes[prayer]) {
					const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
					const date = new Date();
					date.setHours(hours, minutes + offset, 0, 0);
					const jamaatHours = date.getHours();
					const jamaatMinutes = date.getMinutes();
					calculatedJamaatTimes[prayer] = `${jamaatHours
						.toString()
						.padStart(2, '0')}:${jamaatMinutes.toString().padStart(2, '0')}`;
				}
			});
			setJamaatTimes(calculatedJamaatTimes);
		}
		onClose();
	};

	const prayers = [
		{ key: 'Fajr', name: 'Fajr' },
		{ key: 'Dhuhr', name: 'Dhuhr' },
		{ key: 'Asr', name: 'Asr' },
		{ key: 'Maghrib', name: 'Maghrib' },
		{ key: 'Isha', name: 'Isha' },
	];

	// Filter prayers based on selectedPrayer
	const displayPrayers = selectedPrayer
		? prayers.filter((prayer) => prayer.key === selectedPrayer)
		: prayers;

	// Don't render if not open
	if (!isOpen) return null;

	return (
		<div
			className='jamaat-settings-modal'
			onClick={(e) => {
				// Close modal when clicking on backdrop
				if (e.target === e.currentTarget) {
					handleCancel();
				}
			}}
		>
			<div className='jamaat-settings-content'>
				<div className='jamaat-settings-header'>
					<h3>
						<FaCog size={16} style={{ marginRight: '8px' }} />
						{selectedPrayer
							? `Set ${selectedPrayer} Jamaat Time`
							: 'Customize Jamaat Times'}
					</h3>
					<button onClick={handleCancel} className='jamaat-close-btn'>
						<FaTimes />
					</button>
				</div>

				<p className='jamaat-description'>
					{selectedPrayer
						? `Set the exact time when ${selectedPrayer} Jamaat starts at your local mosque`
						: 'Set the exact time when Jamaat starts at your local mosque'}
				</p>

				<div className='jamaat-settings-form'>
					<div className='jamaat-input-group'>
						{displayPrayers.map((prayer) => (
							<div key={prayer.key} className='jamaat-input-row'>
								<img
									src={`/${prayer.key}.svg`}
									alt={prayer.name}
									className='jamaat-prayer-icon'
								/>
								<div className='jamaat-prayer-info'>
									<span className='jamaat-prayer-label'>{prayer.name}</span>
								</div>
								<div className='jamaat-time-input-wrapper'>
									<input
										type='time'
										value={jamaatTimes[prayer.key]}
										onChange={(e) =>
											handleTimeChange(prayer.key, e.target.value)
										}
										className='jamaat-time-input'
									/>
									<span className='jamaat-time-label'>Jamaat Time</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className='jamaat-settings-actions'>
					<button
						onClick={handleCancel}
						className='jamaat-action-btn jamaat-cancel-btn'
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className='jamaat-action-btn jamaat-save-btn'
					>
						Save Jamaat Times
					</button>
				</div>
			</div>
		</div>
	);
};

export default CustomJamaatSettings;
