import React, { useState } from "react";
import "./ToggleSwitch.css";

export default function ToggleSwitch({ onChange, initialState = false }) {
  const [isOn, setIsOn] = useState(initialState);

  const toggleSwitch = () => {
    setIsOn(!isOn);
    if (onChange) {
      onChange(!isOn);
    }
  };

  return (
    <div className="toggle-switch" onClick={toggleSwitch}>
      <div className={`switch ${isOn ? "on" : "off"}`}></div>
    </div>
  );
}