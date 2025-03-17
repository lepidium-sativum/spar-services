// import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../Button/Button";
import Badge from "../Badges/Badge";
import assets from "../../constants/assets";
import { setSkipTutorial } from "../../../store/slices/authSlice";
import { getLogoutUser } from "../../../store/thunk/authThunk";

const Header = (props) => {
  const dispatch = useDispatch();
  const { setShowPopup, showPopup, data } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const sparData = useSelector((state) => state.commonReducer.sparData);
  const selectedModule = useSelector(
    (state) => state.commonReducer.selectedModule
  );
  // console.log("Header : ", data?.id);
  const skipTutorial = useSelector((state) => state.auth.skipTutorial);
  const handleClick = () => {
    // console.log("skiptutorial header: ", skipTutorial);
    dispatch(setSkipTutorial(true));
    localStorage.setItem("skipTutorial", JSON.stringify(true));

    // Redirect to Home page if not already there
    if (window.location.pathname !== "/home") {
      navigate("/home");
    }
  };

  return (
    <div className="sticky z-1 w-full">
      <header>
        <div
          className={
            location.pathname == "/module"
              ? "flex justify-between items-start pt-8 sm:px-6 lg:px-0 xl:pl-0 mt-5"
              : "flex justify-between mx-auto px-0 sm:px-2 lg:px-4"
          }
        >
          {location.pathname == "/module" ? (
            <div className="flex w-full items-center justify-between rounded-[32px] bg-[#303030] p-6 mt-0 mb-4 ">
              <div className=" flex flex-row justify-center items-center">
                <h2 className="text-[18px] font-extrabold text-white leading-[21.94px] tracking-[0.24px]">
                  Module {sparData?.spar?.module_id}
                </h2>
              </div>
              <div className=" text-white text-[20px] font-montserrat font-semibold leading-[24.5px]">
                {selectedModule?.module?.name &&
                  selectedModule.module.name.charAt(0).toUpperCase() +
                    selectedModule.module.name.slice(1)}
              </div>
              <div className="flex flex-row justify-center items-center">
                <Badge text={selectedModule?.module?.level} className="mt-2" />
              </div>
            </div>
          ) : location.pathname == "/allmodules" ? (
            <div className="flex items-center mt-0 justify-start gap-4">
              <h2 className="text-xl font-montserrat font-bold text-white mb-0 tracking-[0.24px]">
                Modules
              </h2>
              <span className="font-light text-white leading-10">|</span>
              <h5 className="text-xl font-montserrat font-light text-white mb-0 tracking-[0.10px]">
                Discover all the available modules
              </h5>
            </div>
          ) : location.pathname == "/myreports" ? (
            <div className="flex items-center justify-start mt-0 gap-4">
              <h2 className="text-xl font-montserrat font-bold text-white mb-0 tracking-[0.24px]">
                Reports
              </h2>
              <span className="font-light text-white leading-10">|</span>
              <h5 className="text-xl font-montserrat font-light text-white mb-0 tracking-[0.10px]">
                Here is the list of all your reports stored by Module
              </h5>
            </div>
          ) : location.pathname == "/newreport" ? (
            <div className="flex flex-wrap justify-between w-full">
              <div className="flex items-center justify-start gap-4">
                <h2 className="text-[20px] leading-[12.87px] font-montserrat font-bold text-white mb-0 tracking-[0.24px]">
                  My Reports
                </h2>
                <span className="text-[20px] leading-[12.87px] font-light text-white">
                  |
                </span>
                <h5 className="text-[24px] leading-[12.87px] font-montserrat font-light text-white mb-0 tracking-[0.10px]">
                  Last results
                </h5>
              </div>
              <div className="">
                <Button
                  onClick={() => {
                    navigate("/myreports");
                  }}
                  className="btn btn-gradient-detail-back mx-auto"
                >
                  Back to the report list
                </Button>
              </div>
            </div>
          ) : location.pathname == "/profile" ? (
            <div className="flex flex-wrap justify-between w-full">
              <div className="flex items-center justify-start gap-4">
                <h2 className="text-[24px] leading-[29.26px] font-montserrat font-bold text-white mb-0 tracking-[0.24px]">
                  Profile
                </h2>
                <span className="text-[20px] leading-normal font-light text-white">
                  |
                </span>
                <h5 className="text-[24px] leading-[29.26px] font-montserrat font-lignt text-white mb-0">
                  Welcome {data?.first_name}
                </h5>
              </div>
              <div className="">
                <Button
                  onClick={() => {
                    dispatch(getLogoutUser());
                    navigate("/login");
                  }}
                  className="btn btn-gradient-logout mx-auto"
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : location.pathname == "/my-stat" ? (
            <div className="flex flex-wrap justify-between w-full">
              <div className="flex items-center justify-start gap-4">
                <h2 className="text-[24px] leading-[29.26px] font-montserrat font-bold text-white mb-0 tracking-[0.24px]">
                  My stats
                </h2>
                <span className="text-[20px] leading-normal font-light text-white">
                  |
                </span>
                <h5 className="text-[24px] leading-normal font-montserrat font-light text-white mb-0">
                  All your performances statistics in one place
                </h5>
              </div>
            </div>
          ) : (
            <div className="flex flex-row justify-between w-full mt-0">
              <div className="flex items-center justify-start gap-4">
                <h2 className="text-xl font-montserrat font-bold text-white mb-0 tracking-[0.24px]">
                  Welcome {data?.first_name}
                  {!skipTutorial ? " !" : ""}
                </h2>
                {!skipTutorial ? (
                  <>
                    <span className="font-light text-white leading-10">|</span>
                    <h5 className="text-xl font-montserrat font-light text-white mb-0 tracking-[0.10px]">
                      Start by choosing a module
                    </h5>
                  </>
                ) : null}
              </div>
              <div className="">
                {!skipTutorial && (
                  <Button
                    onClick={handleClick}
                    className="btn btn-gradient-play mx-auto flex items-center justify-center space-x-2"
                  >
                    <span className="text-[16px] font-montserrat font-semibold leading-[12.87px] ">
                      Play tutorial
                    </span>
                    <img
                      loading="lazy"
                      src={assets.play}
                      alt="Play"
                      className="ml-[13px] w-[17px] h-[20px] cursor-pointer"
                    />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
