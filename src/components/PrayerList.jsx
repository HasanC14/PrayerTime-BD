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
          <div className="prayer-icon">
            <img
              src={`/${prayer.name}.svg`}
              alt={prayer.name}
              width={prayer.name === "Isha" ? 16 : 20}
            />
          </div>
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
