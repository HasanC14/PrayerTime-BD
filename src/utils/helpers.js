const CACHE_KEY = "prayerTimesCache";
const LOCATION_CACHE_KEY = "selectedLocationCache";
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

// Location caching functions
export const getCachedLocation = () => {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn("Error reading location cache:", error);
    return null;
  }
};

export const setCachedLocation = (locationData) => {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
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

// Cities data for Bangladesh
export const cities = [
  { id: 1, name: "Dhaka", lat: 23.810332, lng: 90.4125181 },
  { id: 2, name: "Faridpur", lat: 23.5423919, lng: 89.6308921 },
  { id: 3, name: "Gazipur", lat: 24.0958171, lng: 90.4125181 },
  { id: 4, name: "Gopalganj", lat: 26.4685472, lng: 84.4433318 },
  { id: 5, name: "Jamalpur", lat: 25.312717, lng: 86.4906091 },
  { id: 6, name: "Kishoreganj", lat: 24.4260457, lng: 90.9820668 },
  { id: 7, name: "Madaripur", lat: 23.2393346, lng: 90.1869644 },
  { id: 8, name: "Manikganj", lat: 23.8616512, lng: 90.0003228 },
  { id: 9, name: "Munshiganj", lat: 23.4980931, lng: 90.4126621 },
  { id: 10, name: "Mymensingh", lat: 24.7434484, lng: 90.3983829 },
  { id: 11, name: "Narayanganj", lat: 23.6226398, lng: 90.4997973 },
  { id: 12, name: "Narsingdi", lat: 24.134378, lng: 90.7860057 },
  { id: 13, name: "Netrokona", lat: 24.8103284, lng: 90.8656415 },
  { id: 14, name: "Rajbari", lat: 23.715134, lng: 89.5874819 },
  { id: 15, name: "Shariatpur", lat: 23.2423214, lng: 90.4347711 },
  { id: 16, name: "Sherpur", lat: 25.0746235, lng: 90.1494904 },
  { id: 17, name: "Tangail", lat: 24.244968, lng: 89.9113052 },
  { id: 18, name: "Bogra", lat: 24.8435589, lng: 89.3701078 },
  { id: 19, name: "Joypurhat", lat: 25.0947349, lng: 89.0944937 },
  { id: 20, name: "Naogaon", lat: 24.9131597, lng: 88.7530952 },
  { id: 21, name: "Natore", lat: 24.410243, lng: 89.0076177 },
  { id: 22, name: "Nawabganj", lat: 28.5405365, lng: 79.6305599 },
  { id: 23, name: "Pabna", lat: 24.0113256, lng: 89.2562239 },
  { id: 24, name: "Rajshahi", lat: 24.3635886, lng: 88.6241351 },
  { id: 25, name: "Sirajgonj", lat: 24.3141115, lng: 89.5699615 },
  { id: 26, name: "Dinajpur", lat: 25.6279123, lng: 88.6331758 },
  { id: 27, name: "Gaibandha", lat: 25.3296928, lng: 89.5429652 },
  { id: 28, name: "Kurigram", lat: 25.8072414, lng: 89.6294746 },
  { id: 29, name: "Lalmonirhat", lat: 25.9923398, lng: 89.2847251 },
  { id: 30, name: "Nilphamari", lat: 25.8482798, lng: 88.9414134 },
  { id: 31, name: "Panchagarh", lat: 26.2708705, lng: 88.5951751 },
  { id: 32, name: "Rangpur", lat: 25.7438916, lng: 89.275227 },
  { id: 33, name: "Thakurgaon", lat: 26.0418392, lng: 88.4282616 },
  { id: 34, name: "Barguna", lat: 22.0952915, lng: 90.1120696 },
  { id: 35, name: "Barisal", lat: 22.7029212, lng: 90.3465971 },
  { id: 36, name: "Bhola", lat: 22.1785315, lng: 90.7101023 },
  { id: 37, name: "Jhalokati", lat: 22.57208, lng: 90.1869644 },
  { id: 38, name: "Patuakhali", lat: 22.2248632, lng: 90.4547503 },
  { id: 39, name: "Pirojpur", lat: 22.5790744, lng: 89.9759264 },
  { id: 40, name: "Bandarban", lat: 21.8311002, lng: 92.3686321 },
  { id: 41, name: "Brahmanbaria", lat: 23.9608181, lng: 91.1115014 },
  { id: 42, name: "Chandpur", lat: 23.2513148, lng: 90.8517846 },
  { id: 43, name: "Chittagong", lat: 22.3475365, lng: 91.8123324 },
  { id: 44, name: "Comilla", lat: 23.46188, lng: 91.186911 },
  { id: 45, name: "CoxBazar", lat: 21.4394636, lng: 92.0077316 },
  { id: 46, name: "Feni", lat: 23.0159132, lng: 91.3975831 },
  { id: 47, name: "Khagrachari", lat: 23.1321751, lng: 91.949021 },
  { id: 48, name: "Lakshmipur", lat: 22.9446744, lng: 90.8281907 },
  { id: 49, name: "Noakhali", lat: 22.8723789, lng: 91.0973184 },
  { id: 50, name: "Rangamati", lat: 22.7324173, lng: 92.2985134 },
  { id: 51, name: "Habiganj", lat: 24.4771236, lng: 91.4506565 },
  { id: 52, name: "Maulvibazar", lat: 24.3095344, lng: 91.7314903 },
  { id: 53, name: "Sunamganj", lat: 25.0714535, lng: 91.3991627 },
  { id: 54, name: "Sylhet", lat: 24.904539, lng: 91.8611011 },
  { id: 55, name: "Bagerhat", lat: 22.6602436, lng: 89.7895478 },
  { id: 56, name: "Chuadanga", lat: 23.6160512, lng: 88.8263006 },
  { id: 57, name: "Jessore", lat: 23.1634014, lng: 89.2181664 },
  { id: 58, name: "Jhenaidah", lat: 23.5449873, lng: 89.1726031 },
  { id: 59, name: "Khulna", lat: 22.845641, lng: 89.5403279 },
  { id: 60, name: "Kushtia", lat: 23.8906995, lng: 89.1099368 },
  { id: 61, name: "Magura", lat: 23.4854655, lng: 89.4198305 },
  { id: 62, name: "Meherpur", lat: 23.8051991, lng: 88.6723578 },
  { id: 63, name: "Narail", lat: 23.1656982, lng: 89.4990219 },
  { id: 64, name: "Satkhira", lat: 22.3154812, lng: 89.1114525 },
];
