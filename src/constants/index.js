/**
 * Application Constants
 * Centralized location for all app-wide constants, configuration, and static data
 */

// Cache Configuration
export const CACHE_CONFIG = {
	PRAYER_TIMES_KEY: 'prayerTimesCache',
	LOCATION_KEY: 'selectedLocationCache',
	MOSQUE_KEY: 'selectedMosqueCache',
	NOTIFICATION_SETTINGS_KEY: 'notificationSettings',
	CUSTOM_JAMAAT_SETTINGS_KEY: 'customJamaatSettings',
	JAMAAT_TIMES_KEY: 'jamaatTimesCache',
	DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Prayer Configuration
export const PRAYER_CONFIG = {
	ORDER: ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
	API_METHOD: 8, // University of Islamic Sciences, Karachi
	API_BASE_URL: 'https://api.aladhan.com/v1',
	TIMEZONE: 'Asia/Dhaka',
};

// Default Settings
export const DEFAULT_SETTINGS = {
	notifications: {
		enabled: false,
		jamaatNotification: true,
		prayerNotification: false,
		beforeJamaatMinutes: 5,
		beforePrayerMinutes: 10,
	},
	jamaat: {
		Fajr: 10,
		Dhuhr: 15,
		Asr: 10,
		Maghrib: 5,
		Isha: 15,
	},
};

// Theme Configuration
export const THEME_CONFIG = {
	colors: {
		primary: '#8B5CF6',
		primaryLight: '#A855F7',
		primaryDark: '#7C3AED',
		secondary: '#6f6885',
		accent: '#d7bedc',
		accentLight: '#ecdfee',
		text: '#170939',
		textSecondary: '#6f6885',
		background: 'linear-gradient(135deg, #d7bedc 0%, #ecdfee 100%)',
		glass: {
			primary: 'rgba(255, 255, 255, 0.15)',
			secondary: 'rgba(255, 255, 255, 0.08)',
			border: 'rgba(255, 255, 255, 0.2)',
		},
		success: '#10B981',
		warning: '#F59E0B',
		error: '#EF4444',
	},
	spacing: {
		xs: '4px',
		sm: '8px',
		md: '16px',
		lg: '24px',
		xl: '32px',
		xxl: '48px',
	},
	borderRadius: {
		sm: '8px',
		md: '12px',
		lg: '16px',
		xl: '20px',
		xxl: '24px',
	},
	typography: {
		fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
		fontSize: {
			xs: '10px',
			sm: '12px',
			base: '14px',
			lg: '16px',
			xl: '18px',
			xxl: '20px',
		},
		fontWeight: {
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
	},
	animations: {
		duration: {
			fast: '0.2s',
			normal: '0.3s',
			slow: '0.4s',
		},
		easing: {
			default: 'cubic-bezier(0.4, 0, 0.2, 1)',
			bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
		},
	},
};

// Bangladesh Cities Data
export const BANGLADESH_CITIES = [
	// Dhaka Division
	{ id: 1, name: 'Dhaka', lat: 23.810332, lng: 90.4125181, division: 'Dhaka' },
	{
		id: 2,
		name: 'Faridpur',
		lat: 23.5423919,
		lng: 89.6308921,
		division: 'Dhaka',
	},
	{
		id: 3,
		name: 'Gazipur',
		lat: 24.0958171,
		lng: 90.4125181,
		division: 'Dhaka',
	},
	{
		id: 4,
		name: 'Gopalganj',
		lat: 26.4685472,
		lng: 84.4433318,
		division: 'Dhaka',
	},
	{
		id: 5,
		name: 'Jamalpur',
		lat: 25.312717,
		lng: 86.4906091,
		division: 'Dhaka',
	},
	{
		id: 6,
		name: 'Kishoreganj',
		lat: 24.4260457,
		lng: 90.9820668,
		division: 'Dhaka',
	},
	{
		id: 7,
		name: 'Madaripur',
		lat: 23.2393346,
		lng: 90.1869644,
		division: 'Dhaka',
	},
	{
		id: 8,
		name: 'Manikganj',
		lat: 23.8616512,
		lng: 90.0003228,
		division: 'Dhaka',
	},
	{
		id: 9,
		name: 'Munshiganj',
		lat: 23.4980931,
		lng: 90.4126621,
		division: 'Dhaka',
	},
	{
		id: 10,
		name: 'Mymensingh',
		lat: 24.7434484,
		lng: 90.3983829,
		division: 'Mymensingh',
	},
	{
		id: 11,
		name: 'Narayanganj',
		lat: 23.6226398,
		lng: 90.4997973,
		division: 'Dhaka',
	},
	{
		id: 12,
		name: 'Narsingdi',
		lat: 24.134378,
		lng: 90.7860057,
		division: 'Dhaka',
	},
	{
		id: 13,
		name: 'Netrokona',
		lat: 24.8103284,
		lng: 90.8656415,
		division: 'Mymensingh',
	},
	{
		id: 14,
		name: 'Rajbari',
		lat: 23.715134,
		lng: 89.5874819,
		division: 'Dhaka',
	},
	{
		id: 15,
		name: 'Shariatpur',
		lat: 23.2423214,
		lng: 90.4347711,
		division: 'Dhaka',
	},
	{
		id: 16,
		name: 'Sherpur',
		lat: 25.0746235,
		lng: 90.1494904,
		division: 'Mymensingh',
	},
	{
		id: 17,
		name: 'Tangail',
		lat: 24.244968,
		lng: 89.9113052,
		division: 'Dhaka',
	},

	// Rajshahi Division
	{
		id: 18,
		name: 'Bogra',
		lat: 24.8435589,
		lng: 89.3701078,
		division: 'Rajshahi',
	},
	{
		id: 19,
		name: 'Joypurhat',
		lat: 25.0947349,
		lng: 89.0944937,
		division: 'Rajshahi',
	},
	{
		id: 20,
		name: 'Naogaon',
		lat: 24.9131597,
		lng: 88.7530952,
		division: 'Rajshahi',
	},
	{
		id: 21,
		name: 'Natore',
		lat: 24.410243,
		lng: 89.0076177,
		division: 'Rajshahi',
	},
	{
		id: 22,
		name: 'Nawabganj',
		lat: 28.5405365,
		lng: 79.6305599,
		division: 'Rajshahi',
	},
	{
		id: 23,
		name: 'Pabna',
		lat: 24.0113256,
		lng: 89.2562239,
		division: 'Rajshahi',
	},
	{
		id: 24,
		name: 'Rajshahi',
		lat: 24.3635886,
		lng: 88.6241351,
		division: 'Rajshahi',
	},
	{
		id: 25,
		name: 'Sirajgonj',
		lat: 24.3141115,
		lng: 89.5699615,
		division: 'Rajshahi',
	},

	// Rangpur Division
	{
		id: 26,
		name: 'Dinajpur',
		lat: 25.6279123,
		lng: 88.6331758,
		division: 'Rangpur',
	},
	{
		id: 27,
		name: 'Gaibandha',
		lat: 25.3296928,
		lng: 89.5429652,
		division: 'Rangpur',
	},
	{
		id: 28,
		name: 'Kurigram',
		lat: 25.8072414,
		lng: 89.6294746,
		division: 'Rangpur',
	},
	{
		id: 29,
		name: 'Lalmonirhat',
		lat: 25.9923398,
		lng: 89.2847251,
		division: 'Rangpur',
	},
	{
		id: 30,
		name: 'Nilphamari',
		lat: 25.8482798,
		lng: 88.9414134,
		division: 'Rangpur',
	},
	{
		id: 31,
		name: 'Panchagarh',
		lat: 26.2708705,
		lng: 88.5951751,
		division: 'Rangpur',
	},
	{
		id: 32,
		name: 'Rangpur',
		lat: 25.7438916,
		lng: 89.275227,
		division: 'Rangpur',
	},
	{
		id: 33,
		name: 'Thakurgaon',
		lat: 26.0418392,
		lng: 88.4282616,
		division: 'Rangpur',
	},

	// Barisal Division
	{
		id: 34,
		name: 'Barguna',
		lat: 22.0952915,
		lng: 90.1120696,
		division: 'Barisal',
	},
	{
		id: 35,
		name: 'Barisal',
		lat: 22.7029212,
		lng: 90.3465971,
		division: 'Barisal',
	},
	{
		id: 36,
		name: 'Bhola',
		lat: 22.1785315,
		lng: 90.7101023,
		division: 'Barisal',
	},
	{
		id: 37,
		name: 'Jhalokati',
		lat: 22.57208,
		lng: 90.1869644,
		division: 'Barisal',
	},
	{
		id: 38,
		name: 'Patuakhali',
		lat: 22.2248632,
		lng: 90.4547503,
		division: 'Barisal',
	},
	{
		id: 39,
		name: 'Pirojpur',
		lat: 22.5790744,
		lng: 89.9759264,
		division: 'Barisal',
	},

	// Chittagong Division
	{
		id: 40,
		name: 'Bandarban',
		lat: 21.8311002,
		lng: 92.3686321,
		division: 'Chittagong',
	},
	{
		id: 41,
		name: 'Brahmanbaria',
		lat: 23.9608181,
		lng: 91.1115014,
		division: 'Chittagong',
	},
	{
		id: 42,
		name: 'Chandpur',
		lat: 23.2513148,
		lng: 90.8517846,
		division: 'Chittagong',
	},
	{
		id: 43,
		name: 'Chittagong',
		lat: 22.3475365,
		lng: 91.8123324,
		division: 'Chittagong',
	},
	{
		id: 44,
		name: 'Comilla',
		lat: 23.46188,
		lng: 91.186911,
		division: 'Chittagong',
	},
	{
		id: 45,
		name: "Cox's Bazar",
		lat: 21.4394636,
		lng: 92.0077316,
		division: 'Chittagong',
	},
	{
		id: 46,
		name: 'Feni',
		lat: 23.0159132,
		lng: 91.3975831,
		division: 'Chittagong',
	},
	{
		id: 47,
		name: 'Khagrachari',
		lat: 23.1321751,
		lng: 91.949021,
		division: 'Chittagong',
	},
	{
		id: 48,
		name: 'Lakshmipur',
		lat: 22.9446744,
		lng: 90.8281907,
		division: 'Chittagong',
	},
	{
		id: 49,
		name: 'Noakhali',
		lat: 22.8723789,
		lng: 91.0973184,
		division: 'Chittagong',
	},
	{
		id: 50,
		name: 'Rangamati',
		lat: 22.7324173,
		lng: 92.2985134,
		division: 'Chittagong',
	},

	// Sylhet Division
	{
		id: 51,
		name: 'Habiganj',
		lat: 24.4771236,
		lng: 91.4506565,
		division: 'Sylhet',
	},
	{
		id: 52,
		name: 'Maulvibazar',
		lat: 24.3095344,
		lng: 91.7314903,
		division: 'Sylhet',
	},
	{
		id: 53,
		name: 'Sunamganj',
		lat: 25.0714535,
		lng: 91.3991627,
		division: 'Sylhet',
	},
	{
		id: 54,
		name: 'Sylhet',
		lat: 24.904539,
		lng: 91.8611011,
		division: 'Sylhet',
	},

	// Khulna Division
	{
		id: 55,
		name: 'Bagerhat',
		lat: 22.6602436,
		lng: 89.7895478,
		division: 'Khulna',
	},
	{
		id: 56,
		name: 'Chuadanga',
		lat: 23.6160512,
		lng: 88.8263006,
		division: 'Khulna',
	},
	{
		id: 57,
		name: 'Jessore',
		lat: 23.1634014,
		lng: 89.2181664,
		division: 'Khulna',
	},
	{
		id: 58,
		name: 'Jhenaidah',
		lat: 23.5449873,
		lng: 89.1726031,
		division: 'Khulna',
	},
	{
		id: 59,
		name: 'Khulna',
		lat: 22.845641,
		lng: 89.5403279,
		division: 'Khulna',
	},
	{
		id: 60,
		name: 'Kushtia',
		lat: 23.8906995,
		lng: 89.1099368,
		division: 'Khulna',
	},
	{
		id: 61,
		name: 'Magura',
		lat: 23.4854655,
		lng: 89.4198305,
		division: 'Khulna',
	},
	{
		id: 62,
		name: 'Meherpur',
		lat: 23.8051991,
		lng: 88.6723578,
		division: 'Khulna',
	},
	{
		id: 63,
		name: 'Narail',
		lat: 23.1656982,
		lng: 89.4990219,
		division: 'Khulna',
	},
	{
		id: 64,
		name: 'Satkhira',
		lat: 22.3154812,
		lng: 89.1114525,
		division: 'Khulna',
	},
];

// UI Constants
export const UI_CONFIG = {
	EXTENSION_WIDTH: 380,
	EXTENSION_HEIGHT: 600,
	PRAYER_ICONS: {
		Fajr: '/Fajr.svg',
		Dhuhr: '/Dhuhr.svg',
		Asr: '/Asr.svg',
		Maghrib: '/Maghrib.svg',
		Isha: '/Isha.svg',
	},
	LOADING_MESSAGES: [
		'Loading prayer times...',
		'Fetching location data...',
		'Calculating Jamaat times...',
	],
	ERROR_MESSAGES: {
		NETWORK: 'Unable to connect. Please check your internet connection.',
		LOCATION: 'Unable to determine location. Please select manually.',
		CACHE: 'Unable to load cached data.',
		GENERIC: 'Something went wrong. Please try again.',
	},
};

// Accessibility Labels
export const A11Y_LABELS = {
	prayerCard: (prayer) => `${prayer} prayer time card`,
	jamaatCard: (prayer) => `${prayer} Jamaat time card`,
	editButton: (prayer) => `Edit ${prayer} Jamaat time`,
	settingsButton: 'Open notification settings',
	locationDropdown: 'Select prayer location',
	viewToggle: (view) => `Switch to ${view} view`,
	closeModal: 'Close modal',
	saveSettings: 'Save settings',
};

// Feature Flags (for gradual rollouts)
export const FEATURE_FLAGS = {
	DARK_MODE: true,
	ADVANCED_NOTIFICATIONS: true,
	LOCATION_DETECTION: true,
	OFFLINE_MODE: true,
	ANALYTICS: false, // Privacy-focused, disabled by default
};
