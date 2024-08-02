import React, { useState, useRef } from "react";
import { Camera } from "react-camera-pro";
import "./CameraComponent.css";

const CameraComponent = ({ onCapture, onClose }) => {
  const cameraRef = useRef(null);
  const [isUserMode, setIsUserMode] = useState(true); // Default to user mode

  const handleCapture = () => {
    const image = cameraRef.current.takePhoto();
    if (typeof image === 'string') {
      onCapture(image);
    } else if (image instanceof Blob) {
      const imageUrl = URL.createObjectURL(image);
      onCapture(imageUrl);
    }
  };

  const toggleFacingMode = () => {
    setIsUserMode(!isUserMode);
  };

  return (
    <div className="camera-modal">
      <div className="camera-container">
        {/* Adding a key to force re-render */}
        <Camera
          key={isUserMode ? 'user' : 'environment'} // Force re-render by changing the key
          ref={cameraRef}
          width={300}
          height={300}
          facingMode={isUserMode ? "user" : "environment"}
        />
        <button className="close-button" onClick={onClose}>X</button>
        <button className="toggle-button" onClick={toggleFacingMode}>
          <i className="fas fa-sync-alt"></i>
        </button>
        <div className="camera-buttons">
          <button className="capture-button" onClick={handleCapture}>Take Picture</button>
        </div>
      </div>
    </div>
  );
};

export default CameraComponent;
