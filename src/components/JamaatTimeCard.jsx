import { FaMosque, FaCog, FaPlus } from 'react-icons/fa';
import { convertTo12Hour } from '../utils/helpers';

const JamaatTimeCard = ({
	jamaatOffsets,
	jamaatTimes,
	locationName,
	onSetup,
	onEdit,
}) => {
	// Show setup card if no jamaat offsets are configured
	if (!jamaatOffsets) {
		return (
			<div className='jamaat-card jamaat-card-empty'>
				<FaMosque size={28} className='jamaat-icon' />
				<p>Setup custom Jamaat times for your local mosque in {locationName}</p>
				<button onClick={onSetup} className='jamaat-setup-btn'>
					<FaPlus size={12} style={{ marginRight: '6px' }} />
					Setup Jamaat Times
				</button>
			</div>
		);
	}

	// Show preview card with current jamaat times
	return (
		<div className='jamaat-card jamaat-card-preview'>
			<div className='jamaat-preview-info'>
				<h4>
					<FaMosque size={14} />
					Local Mosque - {locationName}
				</h4>
				<div className='jamaat-times-preview'>
					{jamaatTimes &&
						Object.entries(jamaatTimes).map(([prayer, time]) => (
							<span key={prayer} className='jamaat-time-item'>
								{prayer}: {convertTo12Hour(time)}
							</span>
						))}
				</div>
			</div>
			<button onClick={onEdit} className='jamaat-edit-btn'>
				<FaCog size={10} style={{ marginRight: '4px' }} />
				Settings
			</button>
		</div>
	);
};

export default JamaatTimeCard;
