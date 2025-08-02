// Robust offscreen document for geolocation
console.log("Offscreen document loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Offscreen received message:", message);

  if (message.target !== "offscreen" || message.type !== "get-geolocation") {
    return false;
  }

  // Handle geolocation request immediately
  handleGeolocationRequest(sendResponse);
  return true; // Keep message channel open
});

function handleGeolocationRequest(sendResponse) {
  console.log("Starting geolocation request...");

  if (!navigator.geolocation) {
    sendResponse({ error: "Geolocation not supported" });
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 8000, // 8 seconds
    maximumAge: 30000, // 30 seconds cache
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("Geolocation success:", position);

      // Create a plain object to avoid serialization issues
      const result = {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        },
        timestamp: position.timestamp,
      };

      sendResponse(result);
    },
    (error) => {
      console.error("Geolocation error:", error);

      let errorMessage = "Unknown geolocation error";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied by user";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }

      sendResponse({ error: errorMessage });
    },
    options
  );
}
