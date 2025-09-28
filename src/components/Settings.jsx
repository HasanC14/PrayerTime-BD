/* global chrome */
import { useState, useEffect } from 'react';
import { FaBell, FaCog, FaCheck, FaTimes } from 'react-icons/fa';
import {
	getNotificationSettings,
	setNotificationSettings,
} from '../utils/helpers';

const Settings = ({ isOpen, onClose, onSettingsChange }) => {
	const [settings, setSettings] = useState({
		enabled: false,
		jamaatNotification: true,
		prayerNotification: false,
		beforeJamaatMinutes: 5,
		beforePrayerMinutes: 10,
	});
	const [hasChanges, setHasChanges] = useState(false);

  //test notification state
	// const [testingNotification, setTestingNotification] = useState(false);

	useEffect(() => {
		if (isOpen) {
			const currentSettings = getNotificationSettings();
			setSettings(currentSettings);
			setHasChanges(false);
		}
	}, [isOpen]);

	const handleSettingChange = (key, value) => {
		const newSettings = { ...settings, [key]: value };
		setSettings(newSettings);
		setHasChanges(true);
	};

	const handleSave = async () => {
		try {
			// Request notification permission if enabling notifications
			if (
				settings.enabled &&
				!settings.enabled !== getNotificationSettings().enabled
			) {
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					alert('Notification permission is required for this feature.');
					return;
				}
			}

			setNotificationSettings(settings);

			// Notify background script to update alarms
			if (typeof chrome !== 'undefined' && chrome.runtime) {
				chrome.runtime.sendMessage(
					{ action: 'updateNotificationSettings' },
					(response) => {
						if (response?.success) {
							console.log('Notification settings updated successfully');
						} else {
							console.error(
								'Failed to update notification settings:',
								response?.error
							);
						}
					}
				);
			}

			if (onSettingsChange) {
				onSettingsChange(settings);
			}

			setHasChanges(false);
			onClose();
		} catch (error) {
			console.error('Error saving settings:', error);
			alert('Failed to save settings. Please try again.');
		}
	};

	const handleCancel = () => {
		setHasChanges(false);
		onClose();
	};

	// const testNotification = async () => {
	// 	setTestingNotification(true);
	// 	try {
	// 		if (typeof chrome !== 'undefined' && chrome.runtime) {
	// 			chrome.runtime.sendMessage(
	// 				{ action: 'testNotification' },
	// 				(response) => {
	// 					setTestingNotification(false);
	// 					if (response?.success) {
	// 						console.log('Test notification sent');
	// 					} else {
	// 						console.error(
	// 							'Failed to send test notification:',
	// 							response?.error
	// 						);
	// 						alert(
	// 							'Failed to send test notification. Please check permissions.'
	// 						);
	// 					}
	// 				}
	// 			);
	// 		} else {
	// 			// Fallback for development
	// 			if (Notification.permission === 'granted') {
	// 				new Notification('🕌 PrayerTime BD Test', {
	// 					body: 'Notification system is working correctly!',
	// 					icon: '/logo192.png',
	// 				});
	// 			} else {
	// 				alert('Please enable notifications first');
	// 			}
	// 			setTestingNotification(false);
	// 		}
	// 	} catch (error) {
	// 		console.error('Error testing notification:', error);
	// 		setTestingNotification(false);
	// 		alert('Failed to test notification');
	// 	}
	// };

	if (!isOpen) return null;

	return (
		<div className='settings-overlay'>
			<div className='settings-modal'>
				<div className='settings-header'>
					<div className='settings-title'>
						<FaCog size={16} />
						<span>Notification Settings</span>
					</div>
					<button
						className='close-button'
						onClick={handleCancel}
						aria-label='Close settings'
					>
						<FaTimes size={14} />
					</button>
				</div>

				<div className='settings-content'>
					{/* Master Enable/Disable */}
					<div className='setting-section'>
						<div className='setting-item master-setting'>
							<div className='setting-info'>
								<FaBell size={14} />
								<div>
									<div className='setting-label'>Enable Notifications</div>
									<div className='setting-description'>
										Master switch for all notification features
									</div>
								</div>
							</div>
							<label className='toggle-switch'>
								<input
									type='checkbox'
									checked={settings.enabled}
									onChange={(e) =>
										handleSettingChange('enabled', e.target.checked)
									}
								/>
								<span className='toggle-slider'></span>
							</label>
						</div>
					</div>

					{/* Notification Types */}
					<div className='setting-section'>
						<h4 className='section-title'>Notification Types</h4>

						<div className='setting-item'>
							<div className='setting-info'>
								<div>
									<div className='setting-label'>Jamaat Time Notifications</div>
									<div className='setting-description'>
										Get notified before Jamaat starts at your selected mosque
									</div>
								</div>
							</div>
							<label className='toggle-switch'>
								<input
									type='checkbox'
									checked={settings.jamaatNotification}
									disabled={!settings.enabled}
									onChange={(e) =>
										handleSettingChange('jamaatNotification', e.target.checked)
									}
								/>
								<span className='toggle-slider'></span>
							</label>
						</div>

						<div className='setting-item'>
							<div className='setting-info'>
								<div>
									<div className='setting-label'>Prayer Time Notifications</div>
									<div className='setting-description'>
										Get notified before each prayer time
									</div>
								</div>
							</div>
							<label className='toggle-switch'>
								<input
									type='checkbox'
									checked={settings.prayerNotification}
									disabled={!settings.enabled}
									onChange={(e) =>
										handleSettingChange('prayerNotification', e.target.checked)
									}
								/>
								<span className='toggle-slider'></span>
							</label>
						</div>
					</div>

					{/* Timing Settings */}
					<div className='setting-section'>
						<h4 className='section-title'>Notification Timing</h4>

						<div className='setting-item'>
							<div className='setting-info'>
								<div>
									<div className='setting-label'>Jamaat Reminder</div>
									<div className='setting-description'>
										Minutes before Jamaat time
									</div>
								</div>
							</div>
							<select
								value={settings.beforeJamaatMinutes}
								disabled={!settings.enabled || !settings.jamaatNotification}
								onChange={(e) =>
									handleSettingChange(
										'beforeJamaatMinutes',
										parseInt(e.target.value)
									)
								}
								className='time-select'
							>
								<option value={2}>2 minutes</option>
								<option value={5}>5 minutes</option>
								<option value={10}>10 minutes</option>
								<option value={15}>15 minutes</option>
								<option value={20}>20 minutes</option>
							</select>
						</div>

						<div className='setting-item'>
							<div className='setting-info'>
								<div>
									<div className='setting-label'>Prayer Reminder</div>
									<div className='setting-description'>
										Minutes before prayer time
									</div>
								</div>
							</div>
							<select
								value={settings.beforePrayerMinutes}
								disabled={!settings.enabled || !settings.prayerNotification}
								onChange={(e) =>
									handleSettingChange(
										'beforePrayerMinutes',
										parseInt(e.target.value)
									)
								}
								className='time-select'
							>
								<option value={5}>5 minutes</option>
								<option value={10}>10 minutes</option>
								<option value={15}>15 minutes</option>
								<option value={20}>20 minutes</option>
								<option value={30}>30 minutes</option>
							</select>
						</div>
					</div>

					{/* Test Notification */}
					{/* {settings.enabled && (
						<div className='setting-section'>
							<button
								onClick={testNotification}
								disabled={testingNotification}
								className='test-button'
							>
								{testingNotification ? 'Sending...' : 'Test Notification'}
							</button>
						</div>
					)} */}
				</div>

				<div className='settings-footer'>
					<button onClick={handleCancel} className='cancel-button'>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className={`save-button ${hasChanges ? 'has-changes' : ''}`}
						disabled={!hasChanges}
					>
						<FaCheck size={12} />
						Save Settings
					</button>
				</div>
			</div>
		</div>
	);
};

export default Settings;
