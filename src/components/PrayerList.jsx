import { useMemo } from "react";
import { convertTo12Hour } from "../utils/helpers";

export default function PrayerList({ prayerTimes, prayerName }) {
  const prayerData = useMemo(() => {
    if (!prayerTimes) return [];

    return [
      { name: "Fajr", start: prayerTimes.Fajr, end: prayerTimes.Sunrise },
      // {
      //   name: "Salatud Doha",
      //   start: prayerTimes.Sunrise,
      //   end: prayerTimes.Dhuhr,
      // },
      { name: "Dhuhr", start: prayerTimes.Dhuhr, end: prayerTimes.Asr },
      { name: "Asr", start: prayerTimes.Asr, end: prayerTimes.Maghrib },
      { name: "Maghrib", start: prayerTimes.Maghrib, end: prayerTimes.Isha },
      { name: "Isha", start: prayerTimes.Isha, end: prayerTimes.Fajr },
    ].map((prayer) => ({
      ...prayer,
      startFormatted: convertTo12Hour(prayer.start),
      endFormatted: convertTo12Hour(prayer.end),
    }));
  }, [prayerTimes]);

  return (
    <div className="prayer-times">
      {prayerData.map((prayer) => (
        <div
          key={prayer.name}
          className={`prayer-item ${
            prayerName == prayer.name ? "active" : ""
          } `}
        >
          <svg className="prayer-icon" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5" />
            <path d="m12 1-3 6-6-3 6 3-3 6 3-6 6 3-6-3 3-6z" />
          </svg>
          <div className="prayer-info">
            <span className="prayer-name">{prayer.name}</span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="prayer-time">
                {prayer.startFormatted} - {prayer.endFormatted}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
