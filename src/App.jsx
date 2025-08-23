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
  cities,
} from "../src/utils/helpers";
import "./App.css";
import Footer from "./components/Footer";
import PrayerList from "./components/PrayerList";

// Custom Location Dropdown Component
const LocationDropdown = ({ selectedLocation, onLocationChange, cities }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter cities based on search term
  const filteredCities = useMemo(() => {
    return cities.filter((city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCitySelect = (city) => {
    onLocationChange(city.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className="location-dropdown" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={handleToggle}>
        <span>{selectedLocation?.name || "Select Location"}</span>
        <svg
          className={`dropdown-arrow ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="search-container">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="dropdown-list">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div
                  key={city.id}
                  className={`dropdown-item ${
                    selectedLocation?.id === city.id ? "selected" : ""
                  }`}
                  onClick={() => handleCitySelect(city)}
                >
                  {city.name}
                </div>
              ))
            ) : (
              <div className="dropdown-item no-results">No locations found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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

  const timestamp = Math.floor(Date.now() / 1000);

  // Initialize location on app start
  useEffect(() => {
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      setSelectedLocation(cachedLocation);
    } else {
      // Default to Dhaka
      const dhaka = cities.find((city) => city.name === "Dhaka");
      setSelectedLocation(dhaka);
      setCachedLocation(dhaka);
    }
  }, []);

  // Handle location change
  const handleLocationChange = (cityId) => {
    const newLocation = cities.find((city) => city.id === parseInt(cityId));
    if (newLocation) {
      setSelectedLocation(newLocation);
      setCachedLocation(newLocation);
      // Clear existing prayer times cache when location changes
      localStorage.removeItem("prayerTimesCache");
    }
  };

  // Fetch prayer times with selected location
  const fetchPrayerTimes = useCallback(async () => {
    if (!selectedLocation) return;

    try {
      setIsLoading(true);

      // Check cache first
      const cachedData = getCachedData();
      if (cachedData) {
        setPrayerTimes(cachedData.timings);
        setHijriDate(cachedData.hijriDate);
        setIsLoading(false);
        setIsOffline(false);
        return;
      }

      // Fetch from API
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}&method=8`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const hijriInfo = {
        day: data.data.date.hijri.day,
        month: data.data.date.hijri.month.en,
        year: data.data.date.hijri.year,
        abbreviated: data.data.date.hijri.designation.abbreviated,
      };

      // Cache the data
      setCachedData({
        timings: data.data.timings,
        hijriDate: hijriInfo,
      });

      setHijriDate(hijriInfo);
      setPrayerTimes(data.data.timings);
      setIsLoading(false);
      setIsOffline(false);
    } catch (error) {
      console.error("Error fetching prayer times:", error);

      // Try to use cached data even if expired
      const cachedData = getCachedData();
      if (cachedData) {
        setPrayerTimes(cachedData.timings);
        setHijriDate(cachedData.hijriDate);
        setIsOffline(true);
      }
      setIsLoading(false);
    }
  }, [selectedLocation, timestamp]);

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
  }, [selectedLocation, fetchPrayerTimes]);

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
          Unable to load prayer times. Please check your internet connection.
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
        <LocationDropdown
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
          cities={cities}
        />
      </div>

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
        <img src="/logo1.png" alt="" />
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
    </div>
  );
}

export default App;
