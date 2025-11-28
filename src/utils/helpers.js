import { storage } from "./storage";

const CACHE_KEY = "prayerTimesCache";
const LOCATION_CACHE_KEY = "selectedLocationCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const getTodayDateString = () => {
  const date = new Date();
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

export const getCachedData = async () => {
  try {
    const cached = await storage.get(CACHE_KEY, "local");
    if (!cached) return null;

    const today = getTodayDateString();
    // Check if cached data is for today
    if (cached.date === today) {
      return cached.data;
    }
  } catch (error) {
    console.warn("Error reading cache:", error);
  }
  return null;
};

// Get cached data ignoring date validation (for offline fallback)
export const getRawCachedData = async () => {
  try {
    const cached = await storage.get(CACHE_KEY, "local");
    return cached ? cached.data : null;
  } catch (error) {
    console.warn("Error reading raw cache:", error);
    return null;
  }
};

export const setCachedData = async (data) => {
  try {
    const cacheData = {
      data,
      date: getTodayDateString(),
      timestamp: Date.now(),
    };
    await storage.set(CACHE_KEY, cacheData, "local");
  } catch (error) {
    console.warn("Error setting cache:", error);
  }
};

// Location caching functions
export const getCachedLocation = async () => {
  try {
    return await storage.get(LOCATION_CACHE_KEY, "local");
  } catch (error) {
    console.warn("Error reading location cache:", error);
    return null;
  }
};

export const setCachedLocation = async (locationData) => {
  try {
    await storage.set(LOCATION_CACHE_KEY, locationData, "local");
  } catch (error) {
    console.warn("Error setting location cache:", error);
  }
};

export const convertTo12Hour = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

export const formatTime = (duration) => {
  if (!duration) return null;

  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `  ${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} minute${minutes !== 1 ? "s" : ""
      }`;
  }
  return `  ${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""
    }`;
};

export const getCurrentTime = () => new Date();

export const parseTime = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const getNextPrayerTime = (currentTime, prayerTimes) => {
  if (!prayerTimes)
    return {
      nextPrayerTime: null,
      prayerName: null,
      currentPrayer: null,
    };

  const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  let currentPrayer = null;
  let previousPrayer = null;

  // Find current prayer by checking which prayer window we're in
  for (let i = 0; i < prayerOrder.length; i++) {
    const prayer = prayerOrder[i];
    const nextPrayer = prayerOrder[i + 1] || prayerOrder[0]; // Wrap around to Fajr

    if (prayerTimes[prayer] && prayerTimes[nextPrayer]) {
      const prayerTime = parseTime(prayerTimes[prayer]);
      const nextPrayerTime = parseTime(prayerTimes[nextPrayer]);

      // Handle overnight transition (Isha to Fajr)
      if (prayer === "Isha") {
        const tomorrowFajr = parseTime(prayerTimes.Fajr);
        tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);

        if (
          currentTime >= prayerTime ||
          currentTime < parseTime(prayerTimes.Fajr)
        ) {
          currentPrayer = "Isha";
          break;
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
      if (currentTime < prayerTime) {
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
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return {
    nextPrayerTime: tomorrowFajr,
    prayerName: "Fajr",
    currentPrayer: currentPrayer || "Isha",
  };
};

// Default location (Dhaka, Bangladesh)
export const DHAKA_DEFAULT = {
  name: "Dhaka, Bangladesh",
  lat: 23.810332,
  lng: 90.4125181,
};

const RECENT_LOCATIONS_KEY = "recentLocations";
const MAX_RECENT_LOCATIONS = 5;

// Get recent locations from storage
export const getRecentLocations = async () => {
  try {
    return (await storage.get(RECENT_LOCATIONS_KEY, "local")) || [];
  } catch (error) {
    console.warn("Error reading recent locations:", error);
    return [];
  }
};

// Add location to recent locations (max 5, most recent first)
export const addRecentLocation = async (location) => {
  try {
    const recent = await getRecentLocations();

    // Remove if already exists (to move to top)
    const filtered = recent.filter(
      (loc) => !(loc.lat === location.lat && loc.lng === location.lng)
    );

    // Add to beginning
    const updated = [location, ...filtered].slice(0, MAX_RECENT_LOCATIONS);

    await storage.set(RECENT_LOCATIONS_KEY, updated, "local");
  } catch (error) {
    console.warn("Error saving recent location:", error);
  }
};

