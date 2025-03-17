import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import assets from "../../constants/assets";
import { useDispatch } from "react-redux";
import { getLogoutUser } from "../../../store/thunk/authThunk";
import LogoutButton from "../Button/LogoutButton";

const sidebar = [
  {
    name: "Home",
    icon: assets.Home,
    hoverIcon: assets.HomeHover, // Hover icon
    activeIcon: assets.HomeActive, // Active icon
    url: "home",
  },
  {
    name: "Modules",
    icon: assets.Module,
    hoverIcon: assets.ModuleHover, // Hover icon
    activeIcon: assets.ModuleActive, // Active icon
    url: "allmodules",
  },
  {
    name: "My reports",
    icon: assets.Reports,
    hoverIcon: assets.ReportsHover,
    activeIcon: assets.ReportsActive,
    url: "myreports",
  },
  // {
  //   name: "My Stats",
  //   icon: MyStatIcon,
  //   url: "my-stat",
  // },
];
const sidebarBottom = [
  {
    name: "Home",
    icon: assets.setting,
    // hoverIcon: assets.HomeHover, // Hover icon
    // activeIcon: assets.HomeActive, // Active icon
    url: "home",
  },
  {
    name: "Modules",
    icon: assets.setting,
    // hoverIcon: assets.ModuleHover, // Hover icon
    // activeIcon: assets.ModuleActive, // Active icon
    url: "home",
  },
  {
    name: "My reports",
    icon: assets.setting,
    // hoverIcon: assets.ReportsHover,
    // activeIcon: assets.ReportsActive,
    url: "home",
  },
];
// console.log(Home, HomeHover, HomeActive);

const NewSidebar = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null); // Track the hovered icon

  const isReportActive = () => {
    const currentPath = location.pathname;
    // console.log("Current Path:", currentPath);
    const isActive =
      currentPath.startsWith("/myreports") ||
      currentPath.startsWith("/sparreport") ||
      currentPath.startsWith("/newreport");
    return isActive;
  };
  const reportActive = isReportActive();
  const isAnyModulesSubPathActive = () => {
    const currentPath = location.pathname;
    return (
      currentPath.startsWith("/allmodules") || currentPath.startsWith("/module")
    );
  };
  const modulesActive = isAnyModulesSubPathActive();

  const handleNavigation = (url) => (event) => {
    event.preventDefault(); // Prevent default NavLink behavior
    navigate(url); // Navigate with page refresh
  };
  return (
    <div className="flex flex-col items-center justify-between w-full py-10 px-4 h-screen max-w-[112px]">
      <div className="flex flex-col w-[78px] gap-y-14 h-auto">
        <div className="flex mt-0 justify-center items-center w-full h-[44px]">
          <img loading="lazy" src={assets.logo} alt="" className="size-full" />
        </div>
        <div className=" px-2 flex-grow">
          <ul className="flex flex-col gap-y-8 ">
            {sidebar.map((list, index) => {
              const isHovered = hoveredIndex === index;
              const selected = !location.pathname.startsWith("/profile");
              // console.log("hovered and selected: ", selected);
              return (
                <li className="mb-0 gap-y-14" key={index}>
                  {list.name === "Logout" ? (
                    <a
                      onClick={() => {
                        dispatch(getLogoutUser());
                        navigate("/login");
                      }} // Dispatch logout action on click
                      className="relative flex flex-col justify-center rounded px-2 py-1.5 text-gray-500 sidebar-link sidebar-link-logout"
                    >
                      <div
                        className={`flex justify-center items-center w-8 h-8 rounded-[50%] mx-auto mt-0 mb-1 relative`}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: list.icon }}
                        ></span>
                      </div>
                      <span
                        className={`text-white text-center text-[9px] sidebar-text font-semibold`}
                      >
                        {list?.name}
                      </span>
                    </a>
                  ) : (
                    <NavLink
                      to={list.url}
                      end={list.url === "home"}
                      className={`relative flex flex-col justify-center rounded px-2 py-1.5 text-gray-500 sidebar-link ${
                        selected ? "active-class-name" : ""
                      }`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={handleNavigation(list.url)}
                    >
                      <div
                        className={`flex justify-center items-center w-8 h-8 rounded-[50%] mx-auto mt-0 mb-1 relative  transition-all duration-300 group-hover:bg-green-400/20`}
                      >
                        <img
                          src={
                            (list.url === "home" &&
                              !reportActive &&
                              !modulesActive &&
                              selected) ||
                            (list.url === "myreports" &&
                              reportActive &&
                              selected) ||
                            (list.url === "allmodules" &&
                              modulesActive &&
                              selected)
                              ? list.activeIcon
                              : isHovered
                              ? list.hoverIcon
                              : list.icon
                          }
                          className="w-full h-full transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:opacity-100"
                        />
                      </div>
                      <span
                        className={`text-white text-center text-[9px] sidebar-text font-semibold`}
                      >
                        {list?.name}
                      </span>
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center justify-end w-[78px] h-[344px] gap-14">
        <ul className="flex flex-col">
          {sidebarBottom.map((list, index) => {
            return (
              <NavLink
                to={list.url}
                end={list.url === "home"}
                className={`relative flex flex-col justify-center rounded px-2 py-1.5 text-gray-500 sidebar-link `}
                onClick={handleNavigation(list.url)}
                key={index}
              >
                <div
                  className={`flex justify-center items-center w-8 h-8 rounded-[50%] mx-auto mt-0 mb-1 relative`}
                >
                  {/* <img src={list.icon} className="w-full h-full" /> */}
                </div>
                <span
                  className={`text-white text-center text-[9px] sidebar-text font-semibold`}
                >
                  {/* {list?.name} */}
                </span>
              </NavLink>
            );
          })}
        </ul>
      </div>
      <div className="sticky bottom-0 w-full">
        <LogoutButton />
      </div>
    </div>
  );
};
export default NewSidebar;
