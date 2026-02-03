import { formatPrayerTime } from "../utils/helpers";

const ProhibitedTimesModal = ({ isOpen, onClose, prayerTimes, isRamadanMode, settings }) => {
    if (!isOpen || !prayerTimes) return null;

    const sunrise = prayerTimes.Sunrise;
    const dhuhr = prayerTimes.Dhuhr;
    const maghrib = prayerTimes.Maghrib;

    // Calculate times
    // 1. Sunrise: Start = Sunrise, End = Sunrise + 15m
    // 2. Zawal: Start = Dhuhr - 30m, End = Dhuhr (approx)
    // 3. Sunset: Start = Maghrib - 15m, End = Maghrib

    // Helper to add minutes to a time string like "HH:mm"
    const addMinutes = (time, minutes) => {
        if (!time) return "--:--";
        const [h, m] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        date.setMinutes(date.getMinutes() + minutes);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const times = [
        {
            name: "Sunrise (Forbidden)",
            start: sunrise,
            end: addMinutes(sunrise, 15),
            note: "Wait ~15 mins after Sunrise to pray Salatul Duha."
        },
        {
            name: "Zawal (Forbidden)",
            start: addMinutes(dhuhr, -30),
            end: dhuhr,
            note: "No prayer (Salat) is allowed at solar noon."
        },
        {
            name: "Sunset (Forbidden/Makruh)",
            start: addMinutes(maghrib, -15),
            end: maghrib,
            note: "Forbidden for voluntary prayers. Asr can be prayed if missed."
        }
    ];

    return (
        <div className="settings-overlay" onClick={(e) => {
            if (e.target.className === 'settings-overlay') onClose();
        }}>
            <div className="settings-modal" style={{ maxWidth: '400px', height: 'auto', maxHeight: '80vh' }}>
                <div className="settings-header">
                    <h2>Prohibited Times</h2>
                    <button className="close-button" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="settings-content" style={{ paddingBottom: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                        It is prohibited to perform generic voluntary prayers (Nafl) during these times.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {times.map((item, index) => (
                            <div key={index} style={{
                                background: '#fff0f0',
                                border: '1px solid #ffcccc',
                                borderRadius: '8px',
                                padding: '12px'
                            }}>
                                <div style={{ display: 'flex', flexDirection: "column", marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '16px', color: '#c0392b' }}>{item.name}</strong>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                        {formatPrayerTime(item.start, settings?.timeFormat)} - {formatPrayerTime(item.end, settings?.timeFormat)}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#555' }}>
                                    {item.note}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProhibitedTimesModal;
