import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import assets from "../../constants/assets";
import { logout, user, module, client } from "../../utils/Icon";
import { getLogoutUser } from "../../../store/thunk/authThunk";
import { useDispatch } from "react-redux";

const sidebar = [
  {
    name: "Clients",
    icon: module,
    hover: true,
    url: "clients",
  },
  {
    name: "AllUsers",
    icon: user,
    hover: true,
    url: "users",
  },
  {
    name: "Modules",
    icon: client,
    url: "all-modules",
  },
  // {
  //   name: "Changes",
  //   icon: user,
  //   url: "changes",
  // },
  {
    name: "Logout",
    icon: logout,
    url: "login",
  },
];

const Sidebar = () => {
  // const [sidebarData] = useState(sidebar);
  const dispatch = useDispatch();
  const location = useLocation();

  const isAnyClientsAndUsersSubPathActive = () => {
    const currentPath = location.pathname;
    // console.log("Current Path:", currentPath);
    const isActive =
      currentPath.startsWith("/clients") ||
      currentPath.startsWith("/clientUsers") ||
      currentPath.startsWith("/userModules") ||
      currentPath.startsWith("/clientModules") ||
      currentPath.startsWith("/clientModuleDetail") ||
      currentPath.startsWith("/userspardetails") ||
      currentPath.startsWith("/my-stats");
    // console.log("Is Clients and Users Active:", isActive);
    return isActive;
  };

  const isAnyModulesSubPathActive = () => {
    const currentPath = location.pathname;
    return (
      currentPath.startsWith("/all-modules") ||
      currentPath.startsWith("/create-module") ||
      currentPath.startsWith("/assign-modules") ||
      currentPath.startsWith("/createAvatar") ||
      currentPath.startsWith("/add-objective")
    );
  };

  const clientsAndUsersActive = isAnyClientsAndUsersSubPathActive();
  const modulesActive = isAnyModulesSubPathActive();

  return (
    <div>
      <div className="inline-flex h-16 items-center justify-center w-full mb-14">
        <img src={assets.Logo} alt="logo" className="w-[51px]" />
      </div>
      <div className="inline-flex h-16 items-center justify-center w-full mb-14">
        <div className="px-2">
          <ul className="">
            {sidebar.map((list, index) => (
              <li className="mb-12" key={index}>
                {list.name == "Logout" ? (
                  <a
                    onClick={() => dispatch(getLogoutUser())} // Dispatch logout action on click
                    className="relative flex flex-col justify-center rounded px-2 py-1.5 text-gray-500 sidebar-link"
                  >
                    <div
                      className={`flex justify-center items-center w-8 h-8 rounded-[50%]  mx-auto mt-0 mb-1 relative`}
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
                    to={`/${list.url}`} // Add leading slash here to match path correctly
                    end={list.url === "clients"} // Use end prop for exact matching
                    className={({ isActive }) =>
                      (isActive ||
                      (list.url === "clients" && clientsAndUsersActive) ||
                      (list.url === "all-modules" && modulesActive)
                        ? "active"
                        : "inactive") +
                      " " +
                      "relative flex flex-col rounded px-2 py-1.5 text-gray-500 sidebar-link"
                    }
                  >
                    <div
                      className={`flex justify-center items-center w-8 h-8 rounded-[50%]  mx-auto mt-0 mb-1 relative`}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: list.icon }}
                      ></span>
                    </div>
                    <span
                      className={`text-white text-center text-[9px] sidebar-text`}
                    >
                      {list?.name}
                    </span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
