import React from "react";
import "./button.css";

const Button = (props) => {
  const { children, disabled, style, className, onClick } = props;
  return (
    <button
      onClick={onClick}
      className={`${className} ${disabled ? "btn-disabled" : ""}`}
      style={{
        ...style,
        pointerEvents: disabled ? "none" : "auto", // Prevent clicks when disabled
        opacity: disabled ? 0.5 : 1, // Adjust opacity for visual feedback
      }}
      disabled={disabled} // HTML5 disabled attribute
    >
      {children}
    </button>
  );
};

export default Button;
