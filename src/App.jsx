import Loader from "./components/Loader";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getCachedData,
  setCachedData,
  getCachedLocation,
  setCachedLocation,
  formatTime,
  getCurrentTime,
  getNextPrayerTime,
  DHAKA_DEFAULT,
  addRecentLocation,
  getRawCachedData,
  getCurrentTimeInZone,
  parseTime,
} from "../src/utils/helpers";
import { storage } from "./utils/storage";
import "./App.css";
import Footer from "./components/Footer";
import PrayerList from "./components/PrayerList";
import SettingsModal from "./components/SettingsModal";
import { getPrayerTimes } from "./utils/prayerTimeService";

const DEFAULT_SETTINGS = {
  bgType: "gradient",
  bgColor: "#ffffff",
  // Default gradient components
  gradientStart: "#d7bedc",
  gradientEnd: "#ecdfee",
  gradientAngle: 100,
  // Keep legacy bgGradient for backward compatibility if needed, but we'll construct it dynamically
  bgGradient: "linear-gradient(100deg, #d7bedc 0%, #ecdfee 100%)",
  primaryColor: "#170939",
  secondaryColor: "#6f6885",
  school: 1, // Hanafi
  method: "auto", // Auto - defaults to closest authority
  midnightMode: 0, // Standard
  latitudeAdjustmentMethod: 3, // Angle Based
  timeFormat: "12h", // Default to 12-hour format
};



// Main App Component
function App() {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerName, setPrayerName] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [timezone, setTimezone] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [error, setError] = useState(null);
  const hasLoadedSettings = useRef(false);


  const [forbiddenWarning, setForbiddenWarning] = useState(null);


  // Initialize app data
  useEffect(() => {
    const initApp = async () => {
      // Load settings from storage
      const savedSettings = await storage.get("appSettings");
      if (savedSettings) {
        // Merge saved settings with defaults to ensure all properties exist
        const mergedSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
        setSettings(mergedSettings);
      } else {
        // No saved settings found, using defaults
      }
      // Mark that we've loaded settings from storage
      hasLoadedSettings.current = true;

      // Load location from local storage
      const cachedLocation = await getCachedLocation();
      if (cachedLocation) {
        setSelectedLocation(cachedLocation);
      } else {
        setSelectedLocation(DHAKA_DEFAULT);
        await setCachedLocation(DHAKA_DEFAULT);
      }
    };

    initApp();
  }, []);

  // Handle location change
  const handleLocationChange = async (location) => {
    if (location) {
      console.log("🌍 Location changed:", {
        name: location.name,
        lat: location.lat,
        lng: location.lng,
      });

      // Clear existing prayer times cache FIRST to prevent race condition
      await storage.remove("prayerTimesCache");

      setSelectedLocation(location);
      await setCachedLocation(location);
      await addRecentLocation(location);
    }
  };

  // Fetch prayer times using local calculation
  const fetchPrayerTimes = useCallback(async () => {
    if (!selectedLocation) return; // Prevent run if location not selected

    try {
      setIsLoading(true);
      setError(null);

      // Perform calculation
      const data = getPrayerTimes(selectedLocation, settings, new Date());

      if (data) {
        setHijriDate(data.hijriDate);
        setTimezone(data.timezone);
        setPrayerTimes(data.timings);

        // Cache the calculated data (optional but keeps consistency)
        await setCachedData({
          timings: data.timings,
          hijriDate: data.hijriDate,
          timezone: data.timezone,
        });

        setIsOffline(false);
      } else {
        throw new Error("Unable to calculate prayer times for this location.");
      }

      setIsLoading(false);

    } catch (error) {
      console.error("Error calculating prayer times:", error);
      setError(error.message);
      setIsLoading(false);
    }
  }, [selectedLocation, settings]);

  // Clear prayer times cache only when calculation settings change
  useEffect(() => {
    // Don't clear cache until settings have been loaded from storage
    if (!hasLoadedSettings.current) {
      return;
    }


    // Only clear cache when calculation-related settings change
    storage.remove("prayerTimesCache");
  }, [settings.method, settings.school, settings.midnightMode, settings.latitudeAdjustmentMethod]);

  // Timer effect
  useEffect(() => {
    if (!prayerTimes) return;

    const updateTimer = () => {
      // Use timezone if available, otherwise local time
      let currentTime = timezone ? getCurrentTimeInZone(timezone) : getCurrentTime();

      // Update currentDate state for UI display if needed (e.g., new minute)
      if (Math.abs(currentTime.getTime() - currentDate.getTime()) > 60000) {
        setCurrentDate(currentTime);
      }

      const { nextPrayerTime, currentPrayer } = getNextPrayerTime(
        currentTime,
        prayerTimes,
        timezone
      );

      // === PROHIBITED TIME CHECKS ===
      let warning = null;

      if (prayerTimes.Sunrise && prayerTimes.Dhuhr && prayerTimes.Maghrib) {
        // Parse times for today
        const sunriseTime = parseTime(prayerTimes.Sunrise, timezone);
        const dhuhrTime = parseTime(prayerTimes.Dhuhr, timezone);
        const maghribTime = parseTime(prayerTimes.Maghrib, timezone);

        const MS_PER_MINUTE = 60000;

        // 1. First 15 mins of Sunrise (Salatud Doha Start)
        // Sunrise is when it starts, so prohibited is [Sunrise, Sunrise + 15m]
        const sunriseEndProhibited = new Date(sunriseTime.getTime() + 15 * MS_PER_MINUTE);

        if (currentTime >= sunriseTime && currentTime < sunriseEndProhibited) {
          warning = "The sun is rising. It is prohibited to pray now. Wait approx. 15 minutes to start Salatul Duha.";
        }

        // 2. Last 30 mins before Dhuhr (Zawal)
        const zawalStart = new Date(dhuhrTime.getTime() - 30 * MS_PER_MINUTE);

        if (currentTime >= zawalStart && currentTime < dhuhrTime) {
          warning = "It is Zawal (solar noon). Prayer is prohibited until the sun passes its peak and Dhuhr begins.";
        }

        // 3. Last 15 mins before Maghrib (Asr End)
        const asrProhibitedStart = new Date(maghribTime.getTime() - 15 * MS_PER_MINUTE);

        if (currentTime >= asrProhibitedStart && currentTime < maghribTime) {
          warning = "The sun is setting. Voluntary prayers are prohibited. However, if you missed today's Asr, you can pray it now.";
        }
      }

      setForbiddenWarning(warning);

      if (nextPrayerTime) {
        const timeDiff = nextPrayerTime.getTime() - currentTime.getTime();
        setRemainingTime(timeDiff);
        setPrayerName(currentPrayer);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes, timezone, currentDate]);

  // Fetch prayer times when location changes
  useEffect(() => {
    if (selectedLocation) {
      fetchPrayerTimes();
    }
  }, [selectedLocation?.lat, selectedLocation?.lng, fetchPrayerTimes]);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);



  // Save settings to storage
  useEffect(() => {
    // Don't save defaults over existing settings on initial load
    if (!hasLoadedSettings.current) {
      return;
    }
    storage.set("appSettings", settings);
  }, [settings]);

  // Apply settings to body and CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary-text-color", settings.primaryColor);
    root.style.setProperty("--secondary-text-color", settings.secondaryColor);

    if (settings.bgType === "solid") {
      document.body.style.background = settings.bgColor;
      // For solid background, active prayer gets a glass effect
      root.style.setProperty("--active-prayer-bg", "rgba(255, 255, 255, 0.2)");
    } else {
      // Construct gradient from components if available, otherwise fallback to stored string
      const angle = settings.gradientAngle || 100;
      const start = settings.gradientStart || "#d7bedc";
      const end = settings.gradientEnd || "#ecdfee";

      const gradient = `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
      document.body.style.background = gradient;
      root.style.setProperty("--main-gradient", gradient);

      // Active prayer gets same gradient but with different angle (+135deg)
      const activeGradient = `linear-gradient(${parseInt(angle) + 135}deg, ${start} 0%, ${end} 100%)`;
      root.style.setProperty("--active-prayer-bg", activeGradient);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="load">
        <div>
          <Loader size="large" color={settings.primaryColor} />
        </div>
      </div>
    );
  }

  if (!prayerTimes) {
    return (
      <div className="load">
        <p>
          {error ? (
            <>
              <strong>Error:</strong> {error}
              <br />
              <span style={{ fontSize: "12px", color: "#666" }}>
                (If you see "Failed to fetch", it means the app cannot reach the server. Check your internet, DNS, or <strong>try turning off your VPN</strong>.)
              </span>
            </>
          ) : (
            "Unable to load prayer times. Please check your internet connection."
          )}
        </p>
        <button onClick={fetchPrayerTimes} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container">


      {isOffline && (
        <div
          style={{
            backgroundColor: "#ffeaa7",
            color: "#2d3436",
            padding: "10px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          You're offline. Location search may be unavailable.
        </div>
      )}

      <div className="header">
        <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span
          className="location-display"
          title={selectedLocation?.name || "Select Location"}
        >
          {selectedLocation?.name || "Select Location"}
        </span>
        <button
          className="settings-btn"
          onClick={() => setIsSettingsOpen(true)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
      />


      <div className="time-hero-section">
        <div className="time-display">
          <div className="current-time">
            {prayerName == "Sunrise" ? "Salatud Doha" : prayerName}
          </div>
          <div className="time-info">
            ends in {" "}
            <span style={{ color: forbiddenWarning ? "#c11010" : "inherit", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              {formatTime(remainingTime)}
              {forbiddenWarning && (
                <div className="tooltip-container" style={{ marginLeft: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span className="tooltip-text" style={{ bottom: "150%", width: "240px", marginLeft: "-120px" }}>{forbiddenWarning}</span>
                </div>
              )}
            </span>{" "}
          </div>
        </div>
        {/* <img src="/logo1.png" alt="" /> */}
      </div>

      <div className="date-section">
        <div className="date-label">DATE ────────</div>
        <div className="islamic-date">
          {hijriDate &&
            `${hijriDate.month} ${hijriDate.day}, ${hijriDate.year} ${hijriDate.abbreviated}`}
        </div>
        <div className="gregorian-date">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      <PrayerList
        prayerTimes={prayerTimes}
        prayerName={prayerName == "Sunrise" ? "Salatud Doha" : prayerName}
        timeFormat={settings.timeFormat}
      />
      <Footer />
    </div >
  );
}

export default App;
