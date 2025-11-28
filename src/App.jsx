import { ThreeCircles } from "react-loader-spinner";

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
} from "../src/utils/helpers";
import { storage } from "./utils/storage";
import "./App.css";
import Footer from "./components/Footer";
import PrayerList from "./components/PrayerList";
import SettingsModal from "./components/SettingsModal";

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
  method: 1, // Karachi
  midnightMode: 0, // Standard
  latitudeAdjustmentMethod: 3, // Angle Based
};



// Main App Component
function App() {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerName, setPrayerName] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [error, setError] = useState(null);
  const hasLoadedSettings = useRef(false);



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

  // Fetch prayer times with selected location
  const fetchPrayerTimes = useCallback(async () => {
    if (!selectedLocation) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedData = await getCachedData();
      if (cachedData) {
        setPrayerTimes(cachedData.timings);
        setHijriDate(cachedData.hijriDate);
        setIsLoading(false);
        setIsOffline(false);
        return;
      }

      // Fetch from API
      const timestamp = Math.floor(Date.now() / 1000);

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}&method=${settings.method}&school=${settings.school}&midnightMode=${settings.midnightMode}&latitudeAdjustmentMethod=${settings.latitudeAdjustmentMethod}`
      );
      if (!response.ok) throw new Error(`Network error: ${response.status} ${response.statusText}`);

      const data = await response.json();
      const hijriInfo = {
        day: data.data.date.hijri.day,
        month: data.data.date.hijri.month.en,
        year: data.data.date.hijri.year,
        abbreviated: data.data.date.hijri.designation.abbreviated,
      };

      // Cache the data
      await setCachedData({
        timings: data.data.timings,
        hijriDate: hijriInfo,
      });

      setHijriDate(hijriInfo);
      setPrayerTimes(data.data.timings);
      setIsLoading(false);
      setIsOffline(false);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      setError(error.message);

      // Try to use cached data even if expired
      const cachedData = await getRawCachedData();
      if (cachedData) {
        setPrayerTimes(cachedData.timings);
        setHijriDate(cachedData.hijriDate);
        setIsOffline(true);
        setError(null); // Clear error if cache fallback works
      }
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
      const currentTime = getCurrentTime();
      const { nextPrayerTime, currentPrayer } = getNextPrayerTime(
        currentTime,
        prayerTimes
      );

      if (nextPrayerTime) {
        const timeDiff = nextPrayerTime.getTime() - currentTime.getTime();
        setRemainingTime(timeDiff);
        setPrayerName(currentPrayer);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

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
          <ThreeCircles
            height="100"
            width="100"
            color="#d2a4db"
            visible={true}
          />
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
          You're offline. Showing cached prayer times.
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
            ends in
            <span>{formatTime(remainingTime)}</span>{" "}
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
      />
      <Footer />
    </div >
  );
}

export default App;
