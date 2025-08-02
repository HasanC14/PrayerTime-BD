import { ThreeCircles } from "react-loader-spinner";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getCachedData,
  setCachedData,
  formatTime,
  getCurrentTime,
  getNextPrayerTime,
} from "../src/utils/helpers";
import "./App.css";
import Footer from "./components/Footer";
import PrayerList from "./components/PrayerList";

// Main App Component
function App() {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerName, setPrayerName] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [location, setLocation] = useState({
    city: "",
    country: "",
    lat: null,
    lng: null,
  });

  const timestamp = Math.floor(Date.now() / 1000);

  // Simplified getUserLocation function with direct messaging
  const getUserLocation = useCallback(async () => {
    return new Promise((resolve, reject) => {
      // Check if we're in a Chrome extension environment
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.sendMessage
      ) {
        console.log("Requesting geolocation from service worker...");

        // Send message directly with timeout handling
        const timeoutId = setTimeout(() => {
          reject(new Error("Request timed out - please try again"));
        }, 12000);

        try {
          chrome.runtime.sendMessage(
            { type: "get-geolocation" },
            async (response) => {
              clearTimeout(timeoutId);

              // Check for Chrome runtime errors
              if (chrome.runtime.lastError) {
                console.error(
                  "Chrome runtime error:",
                  chrome.runtime.lastError
                );
                reject(
                  new Error(
                    `Extension error: ${chrome.runtime.lastError.message}`
                  )
                );
                return;
              }

              // Check if we got a response
              if (!response) {
                reject(new Error("No response from extension background"));
                return;
              }

              // Handle error responses
              if (!response.success) {
                reject(new Error(response.error || "Unknown error occurred"));
                return;
              }

              // Extract coordinates
              const locationData = response.data;
              if (!locationData || !locationData.coords) {
                reject(new Error("No location data received"));
                return;
              }

              const { latitude, longitude } = locationData.coords;
              console.log("Got coordinates:", { latitude, longitude });

              try {
                // Get location details
                const geocodeResponse = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );

                let locationInfo = {
                  lat: latitude,
                  lng: longitude,
                  city: "Unknown City",
                  country: "Unknown Country",
                };

                if (geocodeResponse.ok) {
                  const data = await geocodeResponse.json();
                  locationInfo = {
                    lat: latitude,
                    lng: longitude,
                    city: data.city || data.locality || "Unknown City",
                    country: data.countryName || "Unknown Country",
                  };
                }

                console.log("Final location:", locationInfo);
                resolve(locationInfo);
              } catch (geocodeError) {
                console.warn(
                  "Geocoding failed, using coordinates only:",
                  geocodeError
                );
                resolve({
                  lat: latitude,
                  lng: longitude,
                  city: "Unknown City",
                  country: "Unknown Country",
                });
              }
            }
          );
        } catch (sendError) {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to send message: ${sendError.message}`));
        }
      } else {
        // Fallback for non-extension environments
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const geocodeResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );

              let locationInfo = {
                lat: latitude,
                lng: longitude,
                city: "Unknown City",
                country: "Unknown Country",
              };

              if (geocodeResponse.ok) {
                const data = await geocodeResponse.json();
                locationInfo = {
                  lat: latitude,
                  lng: longitude,
                  city: data.city || data.locality || "Unknown City",
                  country: data.countryName || "Unknown Country",
                };
              }

              resolve(locationInfo);
            } catch (error) {
              resolve({
                lat: latitude,
                lng: longitude,
                city: "Unknown City",
                country: "Unknown Country",
              });
            }
          },
          (error) => {
            reject(new Error(`Geolocation failed: ${error.message}`));
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 300000,
          }
        );
      }
    });
  }, []);

  // Fetch prayer times with caching
  const fetchPrayerTimes = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get user location first
      const userLocation = await getUserLocation();
      setLocation(userLocation);
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
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${userLocation.lat}&longitude=${userLocation.lng}&method=8`
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
  }, []);

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

  // Initial data fetch
  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

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
            color="rgb(199, 195, 195)"
            visible={true}
          />
        </div>
      </div>
    );
  }

  if (!prayerTimes) {
    return (
      <div className="load">
        <div>
          <p>
            Unable to load prayer times. Please check your internet connection.
          </p>
          <button
            onClick={fetchPrayerTimes}
            style={{
              padding: "10px 20px",
              marginTop: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
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
        <span>
          {location.city}, {location.country}
        </span>
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
        <svg className="mosque-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      <div className="date-section">
        <div className="date-label">DATE</div>
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
