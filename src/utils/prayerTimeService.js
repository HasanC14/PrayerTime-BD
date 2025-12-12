import {
    Coordinates,
    CalculationMethod,
    PrayerTimes,
    Madhab,
    HighLatitudeRule,
} from "adhan";

/**
 * Maps API calculation method IDs to Adhan library CalculationMethod
 * @param {string|number} methodId - The method ID from settings
 * @returns {Function} Adhan CalculationMethod function
 */
export const getCalculationMethod = (methodId) => {
    // Map based on: https://aladhan.com/calculation-methods
    const methods = {
        0: CalculationMethod.Tehran, // Jafari - closest equivalent
        1: CalculationMethod.Karachi, // University of Islamic Sciences, Karachi
        2: CalculationMethod.NorthAmerica, // Islamic Society of North America
        3: CalculationMethod.MuslimWorldLeague, // Muslim World League
        4: CalculationMethod.UmmAlQura, // Umm Al-Qura University, Makkah
        5: CalculationMethod.Egyptian, // Egyptian General Authority of Survey
        7: CalculationMethod.Tehran, // Institute of Geophysics, University of Tehran
        8: CalculationMethod.Gulf, // Gulf Region
        9: CalculationMethod.Kuwait, // Kuwait
        10: CalculationMethod.Qatar, // Qatar
        11: CalculationMethod.Singapore, // Majlis Ugama Islam Singapura
        12: CalculationMethod.Other, // Union Organization islamic de France (Approximate, generic Other often used)
        13: CalculationMethod.Turkey, // Diyanet İşleri Başkanlığı, Turkey
        14: CalculationMethod.Other, // Spiritual Administration of Muslims of Russia (No direct match, default Other)
        15: CalculationMethod.MoonsightingCommittee, // Moonsighting Committee Worldwide
        16: CalculationMethod.Dubai, // Dubai
        17: CalculationMethod.Other, // JAKIM (No direct match in basic adhan-js, use Other or similar)
        18: CalculationMethod.Other, // Tunisia
        19: CalculationMethod.Other, // Algeria
        20: CalculationMethod.Other, // KEMENAG Indonesia
        21: CalculationMethod.Other, // Morocco
        22: CalculationMethod.Other, // Comunidade Islamica de Lisboa
        23: CalculationMethod.Other, // Jordan
    };

    // Default to MWL if not found or if "auto" (we can improve auto logic later)
    // For "Other" methods, parameters can be customized if precise angles are known
    return methods[methodId] ? methods[methodId]() : CalculationMethod.MuslimWorldLeague();
};

/**
 * Maps school (Asr method) ID to Adhan library Madhab
 * @param {number} schoolId 
 * @returns {number} Adhan Madhab constant
 */
export const getMadhab = (schoolId) => {
    return schoolId === 1 ? Madhab.Hanafi : Madhab.Shafi;
};

/**
 * Maps high latitude rule ID to Adhan library HighLatitudeRule
 * @param {number} ruleId 
 * @returns {number} Adhan HighLatitudeRule constant
 */
export const getHighLatitudeRule = (ruleId) => {
    // 1: Middle of Night, 3: Angle Based (Seventh of Night is 2, but usually AngleBased is preferred)
    return ruleId === 1 ? HighLatitudeRule.MiddleOfTheNight : HighLatitudeRule.TwilightAngle;
};

/**
 * Calculate prayer times locally using adhan library
 * @param {Object} location - { lat, lng }
 * @param {Object} settings - { method, school, midnightMode, latitudeAdjustmentMethod }
 * @param {Date} date - Date object
 * @returns {Object} Formatted prayer times and metadata
 */
export const getPrayerTimes = (location, settings, date = new Date()) => {
    if (!location || !location.lat || !location.lng) return null;

    const coordinates = new Coordinates(location.lat, location.lng);

    // Get calculation parameters
    const params = getCalculationMethod(settings.method);

    // Apply customizations
    params.madhab = getMadhab(settings.school);
    params.highLatitudeRule = getHighLatitudeRule(settings.latitudeAdjustmentMethod);

    // Create PrayerTimes instance
    const prayerTimes = new PrayerTimes(coordinates, date, params);

    // Calculate Midnight based on settings.midnightMode
    // 0: Standard (Mid Sunset to Sunrise), 1: Jafari (Mid Sunset to Fajr)
    let midnightTime;

    // We need next day's times for calculation
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const prayerTimesTomorrow = new PrayerTimes(coordinates, tomorrow, params);

    const sunset = prayerTimes.sunset;

    if (settings.midnightMode === 1) { // Jafari
        const nextFajr = prayerTimesTomorrow.fajr;
        const duration = nextFajr.getTime() - sunset.getTime();
        midnightTime = new Date(sunset.getTime() + duration / 2);
    } else { // Standard (Default)
        const nextSunrise = prayerTimesTomorrow.sunrise;
        const duration = nextSunrise.getTime() - sunset.getTime();
        midnightTime = new Date(sunset.getTime() + duration / 2);
    }

    // Format times as HH:mm (24h format for internal processing, checking against API format)
    const format = (d) => {
        if (!d) return "--:--";
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Construct Hijri date (Simulated/Approximate or using Intl)
    // Since adhan-js doesn't do Hijri conversion, we use Intl.DateTimeFormat
    const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Parse Hijri parts
    let hijriData = { day: "", month: "", year: "", designation: { abbreviated: "AH" } };
    try {
        const parts = hijriFormatter.formatToParts(date);
        const day = parts.find(p => p.type === 'day')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const year = parts.find(p => p.type === 'year')?.value;
        hijriData = { day, month: { en: month }, year, designation: { abbreviated: "AH" } };
    } catch (e) {
        console.warn("Hijri date error", e);
    }

    // Get timezone
    // Intl.DateTimeFormat().resolvedOptions().timeZone gives local, but for location we might want coordinates based tz
    // For now, returning system timezone or "Asia/Dhaka" default if matching default loc
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
        timings: {
            Fajr: format(prayerTimes.fajr),
            Sunrise: format(prayerTimes.sunrise),
            Dhuhr: format(prayerTimes.dhuhr),
            Asr: format(prayerTimes.asr),
            Sunset: format(prayerTimes.sunset), // API doesn't usually emphasize Sunset in main list but maghrib is same
            Maghrib: format(prayerTimes.maghrib),
            Isha: format(prayerTimes.isha),
            Midnight: format(midnightTime),
        },
        hijriDate: {
            day: hijriData.day,
            month: hijriData.month.en,
            year: hijriData.year,
            abbreviated: "AH" // approximated
        },
        timezone: timezone
    };
};
