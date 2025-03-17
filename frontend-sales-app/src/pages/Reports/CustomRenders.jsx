import React from "react";

// Render for "You"
export const CustomRenderYou = () => {
  return (
    <div
      style={{
        backgroundColor: "#95EBA3", // Green for "You"
        borderRadius: "12px", // Rounded corners
        height: "100%", // Full height
      }}
    />
  );
};

// Render for "Avatar"
export const CustomRenderAvatar = () => {
  return (
    <div
      style={{
        backgroundColor: "#EBB495", // Red for "Avatar"
        borderRadius: "12px", // Rounded corners
        height: "100%", // Full height
      }}
    />
  );
};
