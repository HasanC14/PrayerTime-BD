import { useMemo } from 'react';
import { convertTo12Hour } from '../utils/helpers';
import { FaClock, FaMosque, FaEdit, FaCircle } from 'react-icons/fa';

export default function JamaatList({
	prayerTimes,
	jamaatTimes,
	currentPrayer,
	currentJamaat,
	jamaatOffsets,
	onEditJamaat,
}) {
	const prayerData = useMemo(() => {
		if (!prayerTimes || !jamaatTimes) return [];

		return [
			{
				name: 'Fajr',
				prayerTime: prayerTimes.Fajr,
				jamaatTime: jamaatTimes.Fajr,
				offset: jamaatOffsets?.Fajr || 0,
			},
			{
				name: 'Dhuhr',
				prayerTime: prayerTimes.Dhuhr,
				jamaatTime: jamaatTimes.Dhuhr,
				offset: jamaatOffsets?.Dhuhr || 0,
			},
			{
				name: 'Asr',
				prayerTime: prayerTimes.Asr,
				jamaatTime: jamaatTimes.Asr,
				offset: jamaatOffsets?.Asr || 0,
			},
			{
				name: 'Maghrib',
				prayerTime: prayerTimes.Maghrib,
				jamaatTime: jamaatTimes.Maghrib,
				offset: jamaatOffsets?.Maghrib || 0,
			},
			{
				name: 'Isha',
				prayerTime: prayerTimes.Isha,
				jamaatTime: jamaatTimes.Isha,
				offset: jamaatOffsets?.Isha || 0,
			},
		].map((prayer) => ({
			...prayer,
			prayerTimeFormatted: convertTo12Hour(prayer.prayerTime),
			jamaatTimeFormatted: convertTo12Hour(prayer.jamaatTime),
		}));
	}, [prayerTimes, jamaatTimes, jamaatOffsets]);

	if (!jamaatOffsets) {
		return (
			<div className='jamaat-times-placeholder'>
				<div className='placeholder-content'>
					<FaMosque size={20} className='placeholder-icon' />
					<p>Setup Jamaat times to view congregation schedule</p>
				</div>
			</div>
		);
	}

	return (
		<div className='jamaat-times prayer-times'>
			{prayerData.map((prayer) => (
				<div
					key={prayer.name}
					className={`jamaat-card-modern ${
						currentPrayer === prayer.name || currentJamaat === prayer.name
							? 'active'
							: ''
					} ${currentJamaat === prayer.name ? 'jamaat-active' : ''}`}
				>
					{/* Prayer Icon & Name */}
					<div className='prayer-section'>
						<div className='prayer-icon-container'>
							<img
								src={`/${prayer.name}.svg`}
								alt={prayer.name}
								className='prayer-icon-modern '
								width={prayer.name === 'Isha' ? 14 : 16}
								height={prayer.name === 'Isha' ? 14 : 16}
							/>
						</div>
						<div className='prayer-details'>
							<h4 className='prayer-name-modern'>{prayer.name}</h4>
							{currentJamaat === prayer.name && (
								<div className='jamaat-status-modern'>
									<FaCircle className='pulse-dot' size={8} />
									<span>Progress</span>
								</div>
							)}
						</div>
					</div>

					{/* Time Display */}
					<div className='time-display-section'>
						<div className='jamaat-time-main'>
							<span className='time-value-modern'>
								{prayer.jamaatTimeFormatted}
							</span>
							<span className='time-label-modern'>Jamaat</span>
						</div>

						{/* Edit Button */}
						<button
							className='edit-btn-modern'
							onClick={() => onEditJamaat && onEditJamaat(prayer.name)}
							title={`Edit ${prayer.name} Jamaat time`}
						>
							<FaEdit size={12} />
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
