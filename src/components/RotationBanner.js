import React from 'react';
import '../styles/RotationBanner.css';

const RotationBanner = ({ onClose }) => {
  return (
    <div className="rotation-banner">
      <div className="rotation-content">
        <div className="rotation-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M7.34,6.41L0.86,12.9L7.35,19.38L13.84,12.9L7.34,6.41M3.69,12.9L7.35,9.24L11,12.9L7.34,16.56L3.69,12.9M19.36,6.64C17.61,4.88 15.3,4 13,4V0.76L8.76,5L13,9.24V6C14.79,6 16.58,6.68 17.95,8.05C20.68,10.78 20.68,15.22 17.95,17.95C16.58,19.32 14.79,20 13,20C12.45,20 11.95,19.96 11.46,19.86L9.89,21.43C10.86,21.78 11.93,22 13,22C15.3,22 17.61,21.12 19.36,19.36C22.88,15.85 22.88,10.15 19.36,6.64Z" />
          </svg>
        </div>
        <p>Please rotate your device for better viewing</p>
        <button className="close-button" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  );
};

export default RotationBanner; 