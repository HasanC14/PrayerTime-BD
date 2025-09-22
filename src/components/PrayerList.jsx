import { useMemo } from 'react';
import { FaClock } from 'react-icons/fa';
import { convertTo12Hour } from '../utils/helpers';

export default function PrayerList({ prayerTimes, prayerName }) {
	const prayerData = useMemo(() => {
		if (!prayerTimes) return [];

		return [
			{ name: 'Fajr', start: prayerTimes.Fajr, end: prayerTimes.Sunrise },
			// {
			//   name: "Salatud Doha",
			//   start: prayerTimes.Sunrise,
			//   end: prayerTimes.Dhuhr,
			// },
			{ name: 'Dhuhr', start: prayerTimes.Dhuhr, end: prayerTimes.Asr },
			{ name: 'Asr', start: prayerTimes.Asr, end: prayerTimes.Maghrib },
			{ name: 'Maghrib', start: prayerTimes.Maghrib, end: prayerTimes.Isha },
			{ name: 'Isha', start: prayerTimes.Isha, end: prayerTimes.Fajr },
		].map((prayer) => ({
			...prayer,
			startFormatted: convertTo12Hour(prayer.start),
			endFormatted: convertTo12Hour(prayer.end),
		}));
	}, [prayerTimes]);

	return (
		<div className='prayer-times'>
			{prayerData.map((prayer) => (
				<div
					key={prayer.name}
					className={`prayer-card-modern ${
						prayerName === prayer.name ? 'active' : ''
					}`}
				>
					<div className='prayer-section'>
						<div className='prayer-icon-container'>
							<img
								src={`/${prayer.name}.svg`}
								alt={prayer.name}
								className='prayer-icon-modern'
								width={prayer.name === 'Isha' ? 14 : 16}
							/>
						</div>
						<div className='prayer-details'>
							<h3 className='prayer-name-modern font-extrabold'>{prayer.name}</h3>
						</div>
					</div>

					<div className='time-display-section'>
						<div className='prayer-time-main'>
							<span className='time-value-modern'>{prayer.startFormatted} - {prayer.endFormatted}</span>
							
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
