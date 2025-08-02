const CACHE_KEY = "prayerTimesCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const getCachedData = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const now = Date.now();

    if (cached.timestamp && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  } catch (error) {
    console.warn("Error reading cache:", error);
  }
  return null;
};

export const setCachedData = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Error setting cache:", error);
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
    return `  ${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} minute${
      minutes !== 1 ? "s" : ""
    }`;
  }
  return `  ${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${
    seconds !== 1 ? "s" : ""
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
