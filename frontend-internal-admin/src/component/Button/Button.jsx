import React from "react";
import "./button.css";

const Button = (props) => {
  const { children, disabled, style, className, onClick } = props;
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export default Button;
