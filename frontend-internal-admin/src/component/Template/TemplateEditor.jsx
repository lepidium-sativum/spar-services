import React from "react";

const TemplateEditor = ({ value, onChange }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      style={{
        whiteSpace: "pre-line",
        width: "100%",
        height: "100%",
        border: "none",
        outline: "none",
        resize: "none",
        boxSizing: "border-box",
      }}
      className="custom-scrollbar"
      value={value}
      onChange={handleChange}
    />
  );
};

export default TemplateEditor;
