import { useState, useEffect, useMemo, useRef } from 'react';

const MosqueDropdown = ({
	selectedMosque,
	onMosqueChange,
	mosques,
	selectedLocation,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const dropdownRef = useRef(null);
	const searchInputRef = useRef(null);

	// Filter mosques based on search term
	const filteredMosques = useMemo(() => {
		return mosques.filter(
			(mosque) =>
				mosque.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				mosque.address.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [mosques, searchTerm]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
				setSearchTerm('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isOpen]);

	const handleMosqueSelect = (mosque) => {
		onMosqueChange(mosque);
		setIsOpen(false);
		setSearchTerm('');
	};

	const handleToggle = () => {
		setIsOpen(!isOpen);
		if (!isOpen) {
			setSearchTerm('');
		}
	};

	// Show message if no mosques available for selected city
	if (mosques.length === 0) {
		return (
			<div className='mosque-dropdown-disabled'>
				<div className='dropdown-trigger disabled'>
					<svg
						className='mosque-icon'
						width='12'
						height='12'
						viewBox='0 0 24 24'
						fill='currentColor'
					>
						<path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z' />
						<circle cx='7' cy='18' r='2' />
						<circle cx='17' cy='18' r='2' />
						<path d='M12 18H7M17 18H12M12 18V16' />
					</svg>
					<span>No mosques available in {selectedLocation?.name}</span>
				</div>
			</div>
		);
	}

	return (
		<div className='mosque-dropdown' ref={dropdownRef}>
			<div className='dropdown-trigger' onClick={handleToggle}>
				<svg
					className='mosque-icon'
					width='12'
					height='12'
					viewBox='0 0 24 24'
					fill='currentColor'
				>
					<path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z' />
					<circle cx='7' cy='18' r='2' />
					<circle cx='17' cy='18' r='2' />
					<path d='M12 18H7M17 18H12M12 18V16' />
				</svg>
				<span className='mosque-name'>
					{selectedMosque?.name || 'Select Mosque'}
				</span>
				<svg
					className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
					width='12'
					height='12'
					viewBox='0 0 24 24'
					fill='currentColor'
				>
					<path d='M7 10l5 5 5-5z' />
				</svg>
			</div>

			{isOpen && (
				<div className='dropdown-menu mosque-menu'>
					<div className='search-container'>
						<svg
							className='search-icon'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='currentColor'
						>
							<path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' />
						</svg>
						<input
							ref={searchInputRef}
							type='text'
							placeholder='Search mosque...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='search-input'
						/>
					</div>

					<div className='dropdown-list mosque-list'>
						{filteredMosques.length > 0 ? (
							filteredMosques.map((mosque) => (
								<div
									key={mosque.id}
									className={`dropdown-item mosque-item ${
										selectedMosque?.id === mosque.id ? 'selected' : ''
									}`}
									onClick={() => handleMosqueSelect(mosque)}
								>
									<div className='mosque-info'>
										<div className='mosque-name-item'>{mosque.name}</div>
										<div className='mosque-address'>{mosque.address}</div>
									</div>
									<div className='jamaat-info'>
										<span className='jamaat-label'>
											Jamaat: +{mosque.jamaatTimes.Fajr}min
										</span>
									</div>
								</div>
							))
						) : (
							<div className='dropdown-item no-results'>No mosques found</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default MosqueDropdown;
