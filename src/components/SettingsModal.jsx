import { useState, useEffect, useCallback, useRef } from "react";
import { getRecentLocations } from "../utils/helpers";

const PREDEFINED_GRADIENTS = [
  { name: "Default", start: "#d7bedc", end: "#ecdfee", angle: 100 },
  { name: "Sunset", start: "#f6d365", end: "#fda085", angle: 120 },
  { name: "Ocean", start: "#84fab0", end: "#8fd3f4", angle: 120 },
  { name: "Night", start: "#30cfd0", end: "#330867", angle: 0 }, // to top = 0deg
  { name: "Purple", start: "#a18cd1", end: "#fbc2eb", angle: 0 },
  { name: "Morning", start: "#e0c3fc", end: "#8ec5fc", angle: 120 },
];

const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_DELAY = 300;

const CALCULATION_METHODS = [
  { id: "auto", name: "Auto (Closest Authority)" },
  { id: 0, name: "Jafari / Shia Ithna-Ashari" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 2, name: "Islamic Society of North America" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 11, name: "Majlis Ugama Islam Singapura, Singapore" },
  { id: 12, name: "Union Organization islamic de France" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, name: "Spiritual Administration of Muslims of Russia" },
  { id: 15, name: "Moonsighting Committee Worldwide" },
  { id: 16, name: "Dubai (experimental)" },
  { id: 17, name: "Jabatan Kemajuan Islam Malaysia (JAKIM)" },
  { id: 18, name: "Tunisia" },
  { id: 19, name: "Algeria" },
  { id: 20, name: "KEMENAG - Kementerian Agama Republik Indonesia" },
  { id: 21, name: "Morocco" },
  { id: 22, name: "Comunidade Islamica de Lisboa" },
  { id: 23, name: "Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan" },
];

const ASR_METHODS = [
  { id: 0, name: "Standard (Shafi, Maliki, Hanbali)" },
  { id: 1, name: "Hanafi" },
];

const MIDNIGHT_MODES = [
  { id: 0, name: "Standard" },
  { id: 1, name: "Jafari" },
];

const LATITUDE_ADJUSTMENTS = [
  { id: 1, name: "Middle of Night" },
  { id: 3, name: "Angle Based" },
];

const CircularAnglePicker = ({ angle, onChange }) => {
  const pickerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((e) => {
    if (!pickerRef.current) return;

    const rect = pickerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate angle in degrees
    // Math.atan2(y, x) returns radians. We want 0 at top (12 o'clock)
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let rad = Math.atan2(deltaY, deltaX);
    let deg = rad * (180 / Math.PI);

    // Adjust to make 0 at top (currently 0 is at 3 o'clock)
    deg = deg + 90;

    // Normalize to 0-360
    if (deg < 0) deg += 360;

    onChange(Math.round(deg));
  }, [onChange]);

  const handleMouseDown = (e) => {
    // Prevent default to stop text selection/scrolling while dragging
    // e.preventDefault(); 
    setIsDragging(true);
    handleInteraction(e);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault(); // Prevent scrolling on touch devices
        handleInteraction(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleInteraction]);

  return (
    <div className="angle-picker-container">
      <div
        className="angle-picker"
        ref={pickerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div
          className="angle-indicator"
          style={{
            transform: `rotate(${angle}deg) translate(0, -14px)`
          }}
        />
      </div>
      <div className="angle-value">{angle}°</div>
    </div>
  );
};

const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  selectedLocation,
  onLocationChange,
}) => {
  const [activeTab, setActiveTab] = useState("appearance");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentLocations, setRecentLocations] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Defensive check for settings
  const safeSettings = settings || {};

  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...safeSettings, [key]: value });
  };

  // Load recent locations when modal opens
  useEffect(() => {
    if (isOpen && activeTab === "location") {
      getRecentLocations().then(setRecentLocations);
    }
  }, [isOpen, activeTab]);

  // Fetch suggestions from LocationIQ API
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
          query
        )}&limit=5&dedupe=1`
      );

      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      const formattedSuggestions = data.map((item) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced search handler
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= MIN_SEARCH_LENGTH) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, DEBOUNCE_DELAY);
    } else {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchSuggestions]);

  // Reset search term when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSuggestions([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayLocations = searchTerm.length >= MIN_SEARCH_LENGTH
    ? suggestions
    : recentLocations;

  const showNoResults = searchTerm.length >= MIN_SEARCH_LENGTH &&
    !isLoadingSuggestions &&
    suggestions.length === 0;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === "appearance" ? "active" : ""}`}
            onClick={() => setActiveTab("appearance")}
          >
            Appearance
          </button>
          <button
            className={`tab-button ${activeTab === "location" ? "active" : ""}`}
            onClick={() => setActiveTab("location")}
          >
            Location
          </button>
          <button
            className={`tab-button ${activeTab === "calculation" ? "active" : ""}`}
            onClick={() => setActiveTab("calculation")}
          >
            Calculation
          </button>
        </div>

        <div className="settings-content">
          {activeTab === "appearance" && (
            <div className="appearance-settings">
              <div className="setting-group">
                <label>Time Format</label>
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${safeSettings.timeFormat === "12h" ? "active" : ""
                      }`}
                    onClick={() => handleSettingChange("timeFormat", "12h")}
                  >
                    12 Hour
                  </button>
                  <button
                    className={`toggle-btn ${safeSettings.timeFormat === "24h" ? "active" : ""
                      }`}
                    onClick={() => handleSettingChange("timeFormat", "24h")}
                  >
                    24 Hour
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label>Background Style</label>
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${safeSettings.bgType === "solid" ? "active" : ""
                      }`}
                    onClick={() => handleSettingChange("bgType", "solid")}
                  >
                    Solid Color
                  </button>
                  <button
                    className={`toggle-btn ${safeSettings.bgType === "gradient" ? "active" : ""
                      }`}
                    onClick={() => handleSettingChange("bgType", "gradient")}
                  >
                    Gradient
                  </button>
                </div>
              </div>

              {safeSettings.bgType === "solid" ? (
                <div className="setting-group">
                  <label>Background Color</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={safeSettings.bgColor || "#ffffff"}
                      onChange={(e) => handleSettingChange("bgColor", e.target.value)}
                    />
                    <span>{safeSettings.bgColor || "#ffffff"}</span>
                  </div>
                </div>
              ) : (
                <div className="setting-group">
                  <div className="custom-gradient-section">
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "12px", marginBottom: "8px", display: "block" }}>Gradient Style</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
                        <div style={{ flex: 1, display: "flex", gap: "8px" }}>
                          <div className="color-picker-wrapper" style={{ padding: "4px 8px", border: "none", background: "transparent" }}>
                            <input
                              type="color"
                              value={safeSettings.gradientStart || "#d7bedc"}
                              onChange={(e) => handleSettingChange("gradientStart", e.target.value)}
                            />
                            <span>Start</span>
                          </div>
                          <div className="color-picker-wrapper" style={{ padding: "4px 8px", border: "none", background: "transparent" }}>
                            <input
                              type="color"
                              value={safeSettings.gradientEnd || "#ecdfee"}
                              onChange={(e) => handleSettingChange("gradientEnd", e.target.value)}
                            />
                            <span >End</span>
                          </div>
                        </div>

                        <div style={{ width: "1px", height: "50px", background: "#e2e8f0" }}></div>

                        <div style={{ padding: "0 8px" }}>
                          <CircularAnglePicker
                            angle={safeSettings.gradientAngle || 100}
                            onChange={(newAngle) => handleSettingChange("gradientAngle", newAngle)}
                          />
                        </div>
                      </div>
                    </div>

                    <label style={{ fontSize: "12px", marginBottom: "8px", display: "block" }}>Quick Select</label>
                    <div className="gradient-grid">
                      {PREDEFINED_GRADIENTS.map((gradient) => (
                        <div
                          key={gradient.name}
                          className={`gradient-option ${safeSettings.gradientStart === gradient.start &&
                            safeSettings.gradientEnd === gradient.end
                            ? "selected"
                            : ""
                            }`}
                          style={{
                            background: `linear-gradient(${gradient.angle}deg, ${gradient.start} 0%, ${gradient.end} 100%)`
                          }}
                          onClick={() => {
                            onSettingsChange({
                              ...safeSettings,
                              bgType: "gradient",
                              gradientStart: gradient.start,
                              gradientEnd: gradient.end,
                              gradientAngle: gradient.angle
                            });
                          }}
                          title={gradient.name}
                        >
                          {safeSettings.gradientStart === gradient.start &&
                            safeSettings.gradientEnd === gradient.end && (
                              <div className="check-mark">✓</div>
                            )}
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

              <div className="divider"></div>

              <div className="setting-group">
                <label>Primary Text Color</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={safeSettings.primaryColor || "#000000"}
                    onChange={(e) =>
                      handleSettingChange("primaryColor", e.target.value)
                    }
                  />
                  <span>{safeSettings.primaryColor}</span>
                </div>
              </div>

              <div className="setting-group">
                <label>Secondary Text Color</label>
                <div className="color-picker-wrapper">
                  <input
                    type="color"
                    value={safeSettings.secondaryColor || "#666666"}
                    onChange={(e) =>
                      handleSettingChange("secondaryColor", e.target.value)
                    }
                  />
                  <span>{safeSettings.secondaryColor}</span>
                </div>
              </div>

              <button
                className="reset-button"
                onClick={() => {
                  onSettingsChange({
                    ...safeSettings,
                    bgType: "gradient",
                    bgColor: "#ffffff",
                    gradientStart: "#d7bedc",
                    gradientEnd: "#ecdfee",
                    gradientAngle: 100,
                    primaryColor: "#170939",
                    secondaryColor: "#6f6885",
                    timeFormat: "12h",
                  });
                }}
                style={{
                  marginTop: "24px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#64748b",
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f8fafc";
                  e.target.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                  e.target.style.borderColor = "#e2e8f0";
                }}
              >
                Reset to Default
              </button>
            </div>
          )}

          {activeTab === "location" && (
            <div className="location-settings">
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
                  type="text"
                  placeholder="Search location (min 3 characters)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {searchTerm.length > 0 && searchTerm.length < MIN_SEARCH_LENGTH && (
                <div className="search-hint">
                  Type at least {MIN_SEARCH_LENGTH} characters to search
                </div>
              )}

              {isLoadingSuggestions && (
                <div className="loading-suggestions">Searching...</div>
              )}

              <div className="city-list">
                {searchTerm.length === 0 && recentLocations.length > 0 && (
                  <div className="list-header">Recent Locations</div>
                )}

                {displayLocations.length > 0 ? (
                  displayLocations.map((location, index) => (
                    <div
                      key={index}
                      className={`city-item ${selectedLocation?.lat === location.lat &&
                        selectedLocation?.lng === location.lng
                        ? "selected"
                        : ""
                        }`}
                      onClick={() => {
                        console.log("📍 Location selected from list:", {
                          name: location.name,
                          lat: location.lat,
                          lng: location.lng,
                          source: searchTerm.length >= MIN_SEARCH_LENGTH ? "API" : "Recent",
                        });
                        onLocationChange(location);
                        setSearchTerm("");
                        setSuggestions([]);
                      }}
                    >
                      <span>{location.name}</span>
                      {selectedLocation?.lat === location.lat &&
                        selectedLocation?.lng === location.lng && (
                          <span className="check-icon">✓</span>
                        )}
                    </div>
                  ))
                ) : showNoResults ? (
                  <div className="no-results">No locations found</div>
                ) : searchTerm.length === 0 && recentLocations.length === 0 ? (
                  <div className="no-results">No recent locations. Search to find a location.</div>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === "calculation" && (
            <div className="calculation-settings">
              <div className="setting-group">
                <label>
                  Calculation Method
                  <div className="tooltip-container">
                    <span className="tooltip-icon">?</span>
                    <span className="tooltip-text">Determines the angles used for Fajr and Isha prayers based on your region.</span>
                  </div>
                </label>
                <select
                  className="settings-select"
                  value={safeSettings.method}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Keep "auto" as string, convert numbers to actual numbers
                    handleSettingChange("method", value === "auto" ? "auto" : Number(value));
                  }}
                >
                  {CALCULATION_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-group">
                <label>
                  Asr Method
                  <div className="tooltip-container">
                    <span className="tooltip-icon">?</span>
                    <span className="tooltip-text">Standard (Shafi, Maliki, Hanbali) uses shadow ratio 1:1. Hanafi uses shadow ratio 2:1.</span>
                  </div>
                </label>
                <select
                  className="settings-select"
                  value={safeSettings.school}
                  onChange={(e) => handleSettingChange("school", Number(e.target.value))}
                >
                  {ASR_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-group">
                <label>
                  Midnight Mode
                  <div className="tooltip-container">
                    <span className="tooltip-icon">?</span>
                    <span className="tooltip-text">Standard calculates midnight as halfway between Sunset and Sunrise. Jafari calculates it between Sunset and Fajr.</span>
                  </div>
                </label>
                <select
                  className="settings-select"
                  value={safeSettings.midnightMode}
                  onChange={(e) => handleSettingChange("midnightMode", Number(e.target.value))}
                >
                  {MIDNIGHT_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-group">
                <label>
                  High Latitude Rule
                  <div className="tooltip-container">
                    <span className="tooltip-icon">?</span>
                    <span className="tooltip-text">Adjusts prayer times for locations with high latitudes where twilight may persist or days are very long.</span>
                  </div>
                </label>
                <select
                  className="settings-select"
                  value={safeSettings.latitudeAdjustmentMethod}
                  onChange={(e) =>
                    handleSettingChange("latitudeAdjustmentMethod", Number(e.target.value))
                  }
                >
                  {LATITUDE_ADJUSTMENTS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
