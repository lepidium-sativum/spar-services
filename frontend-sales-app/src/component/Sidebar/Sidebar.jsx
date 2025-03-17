import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import assets from "../../constants/assets";
import { useDispatch } from "react-redux";
import { getLogoutUser } from "../../../store/thunk/authThunk";
import UserProfile from "../Footer/UserProfile";
import PoweredBy from "../Footer/PoweredBy";

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
// console.log(Home, HomeHover, HomeActive);

const Sidebar = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null); // Track the hovered icon

  const isReportActive = () => {
    const currentPath = location.pathname;
    // console.log("Current Path:", currentPath);
    const isActive =
      currentPath.startsWith("/myreports") ||
      currentPath.startsWith("/sparreport");
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
    <div className="flex fixed flex-col items-center w-full pt-0 h-screen max-w-[200px]">
      <div className="flex mt-0 justify-center items-center w-[150px] h-[100px]">
        <img
          loading="lazy"
          src={assets.logo}
          alt=""
          className="w-[140px] h-[44px]"
        />
      </div>
      <div className="px-2 flex-grow mt-14">
        <ul className="flex flex-col gap-y-0">
          {sidebar.map((list, index) => {
            const isHovered = hoveredIndex === index;
            const selected = !location.pathname.startsWith("/profile");
            // console.log("hovered and selected: ", selected);
            return (
              <li className="mb-7" key={index}>
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
                      className={`flex justify-center items-center w-8 h-8 rounded-[50%] mx-auto mt-0 mb-1 relative`}
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
                        className="w-full h-full"
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
      <div className="sticky bottom-0 w-full bg-zinc-90">
        <UserProfile data={data} />
        <PoweredBy />
      </div>
    </div>
  );
};
export default Sidebar;
