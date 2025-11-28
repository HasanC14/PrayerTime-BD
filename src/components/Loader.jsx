import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', color = '#170939' }) => {
    const sizeMap = {
        small: '24px',
        medium: '40px',
        large: '60px'
    };

    return (
        <div
            className="css-loader"
            style={{
                width: sizeMap[size],
                height: sizeMap[size],
                borderColor: `${color}33`,
                borderTopColor: color
            }}
        />
    );
};

export default Loader;
