// Layout.js
import { createContext, useEffect, useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../component/Sidebar/Sidebar";
import Header from "../component/Header/Header";
import { getuserProfileData } from "../../store/thunk/authThunk";
import NewSidebar from "../component/Sidebar/NewSidebar";
export const ThemeContext = createContext(null);

const Layout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);
  const [expandView, setExpandView] = useState(false); // Track full-screen mode

  const getModule = useSelector((state) => state.commonReducer.getModule);
  const userProfileData = useSelector((state) => state.auth.userProfileData);
  const scrollContainerRef = useRef(null); // Ref for the scrollable container
  const isNewReportRoute = location.pathname === "/newreport";
  const isModuleRoute = location.pathname === "/module";
  // console.log("route: ", isNewReportRoute);

  useEffect(() => {
    dispatch(getuserProfileData());
  }, [dispatch]);
  return (
    <ThemeContext.Provider
      value={{ getModule, showPopup, setShowPopup, scrollContainerRef }}
    >
      <div
        className={`flex fixed h-screen w-full gap-y-0 dark:bg-[#161618] ${
          isNewReportRoute
            ? "bg-[#161618]"
            : "bg-[radial-gradient(50%_50%_at_50%_50%,rgba(39,39,39,0.96)_0%,#272727_100%)]"
        }  py-0`}
      >
        {isNewReportRoute ? (
          <div className="fixed top-2 left-4 h-[calc(100vh-16px)] w-[15vw] max-w-[112px] bg-[#28282A] rounded-[32px] z-50">
            <NewSidebar data={userProfileData} />
          </div>
        ) : !isModuleRoute && !expandView ? (
          <div className="fixed h-full top-0 left-0 w-[200px] bg-[linear-gradient(128.49deg,#323232_0%,#292424_100%)] z-50 shadow-[20px_0px_44px_0px_rgba(0,0,0,0.25)]">
            <Sidebar data={userProfileData} />
          </div>
        ) : null}
        <div
          ref={scrollContainerRef} // Attach the ref here
          className={`${
            isNewReportRoute
              ? "ml-[112px]"
              : isModuleRoute
              ? "ml-0"
              : "ml-[200px]"
          } flex-1 overflow-auto w-[1593px] items-center sm:px-6 lg:px-8 px-5 custom-scrollbar pb-2 ${
            expandView ? "h-screen" : "h-[calc(100vh)]"
          }`}
        >
          {!expandView && (
            <div
              className={`flex h-[52px] justify-between ${
                isModuleRoute ? "py-5" : "py-12"
              } items-center`}
            >
              <Header
                setShowPopup={setShowPopup}
                showPopup={showPopup}
                data={userProfileData}
              />
            </div>
          )}
          <Outlet context={{ expandView, setExpandView }} />
        </div>
      </div>
    </ThemeContext.Provider>
  );
};
export default Layout;
