import { useMemo } from "react";
import { formatPrayerTime } from "../utils/helpers";

export default function PrayerList({ prayerTimes, prayerName, timeFormat, ramadanMode }) {
  const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  // Find the index of the current active prayer
  // Note: prayerName might be "Salatud Doha" which maps to Sunrise
  const activeName = prayerName === "Salatud Doha" ? "Sunrise" : prayerName;
  const activeIndex = prayerOrder.indexOf(activeName);

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
    ].map((prayer) => {
      let displayName = prayer.name;
      let highlight = false;



      return {
        ...prayer,
        displayName,
        highlight,
        startFormatted: formatPrayerTime(prayer.start, timeFormat),
        endFormatted: formatPrayerTime(prayer.end, timeFormat),
      };
    });
  }, [prayerTimes, timeFormat, ramadanMode]);

  return (
    <div className="prayer-times">
      {prayerData.map((prayer) => {
        const prayerIndex = prayerOrder.indexOf(prayer.name);
        const isPassed = activeIndex !== -1 && prayerIndex < activeIndex;
        // Special case: if active is Isha, and we are showing next day's Fajr in the list? 
        // No, the list shows distinct prayers. 
        // If current is Isha, Fajr/Dhuhr/Asr/Maghrib are passed.

        return (
          <div
            key={prayer.name}
            className={`prayer-item ${prayerName == prayer.name ? "active" : ""}`}
            style={{
              opacity: isPassed ? 0.5 : 1,
              filter: isPassed ? 'grayscale(0.5)' : 'none',
              // ...(prayer.highlight && { border: '1px solid rgba(251, 191, 36, 0.4)', background: 'rgba(251, 191, 36, 0.1)' })
            }}
          >
            <div className="prayer-icon">
              <img
                src={`/${prayer.name}.svg`}
                alt={prayer.name}
                width={prayer.name === "Isha" ? 16 : 20}
              />
            </div>
            <div className="prayer-info">
              <span className="prayer-name" style={{ fontWeight: prayer.highlight ? 'bold' : 'normal' }}>
                {prayer.displayName}
              </span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="prayer-time">
                  {prayer.startFormatted} - {prayer.endFormatted}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
