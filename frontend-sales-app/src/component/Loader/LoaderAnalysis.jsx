import React from "react";
import assets from "../../constants/assets";


const LoaderAnalysis = () => {
  return (
    <div className="mx-auto">
      <div className="custom-loader">
        <div className="loader"></div>
        <div className="logo-image">
          <img src={assets.SparLogo} alt="" />
        </div>
      </div>
    </div>
  );
};

export default LoaderAnalysis;
