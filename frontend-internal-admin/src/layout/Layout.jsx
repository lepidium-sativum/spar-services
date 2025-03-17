// Layout.js
import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "../component/Sidebar/Sidebar";

// import Header from "../component/Header/Header";
import Clients from "../pages/Dashboard/Client/Clients";
import ClientUsers from "../pages/Dashboard/Client/ClientUsers";
import NotFound from "../pages/Login/404";
import UserModules from "../pages/Dashboard/Client/UserModules";
import AllModules from "../pages/Dashboard/Modules/AllModules";
import Changes from "../pages/Dashboard/Changes/Changes";
import ClientModules from "../pages/Dashboard/Client/ClientModules";
import ClientModuleDetail from "../pages/Dashboard/Client/ClientModuleDetail";
import UserSparDetails from "../pages/Dashboard/Client/UserSparDetails";
import CreateModule from "../pages/Dashboard/Modules/CreateModule";
import AssignModules from "../pages/Dashboard/Modules/AssignModules";
import CreateAvatar from "../pages/Dashboard/Modules/CreateAvatar";
import MyStats from "../pages/Dashboard/Analysis/MyStats";
import AddObjective from "../pages/Dashboard/Modules/AddObjective";
import AllUsers from "../pages/Dashboard/Users/AllUsers";

const Layout = () => {
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();

  const getBackgroundClass = () => {
    if (location.pathname === "/my-stats") {
      return "bg-custom-background";
    }
    return "bg-[#ffffff]";
  };
  return (
    <div
      className={`flex h-screen overflow-hidden ${getBackgroundClass()} mt-0`}
    >
      <div className="flex h-screen w-36 flex-col justify-between border-en bg-[linear-gradient(128deg,#333_0%,#232323_100%)]">
        <Sidebar />
      </div>
      <div className="w-full overflow-y-auto custom-scrollbar ">
        {/* <Header setShowPopup={setShowPopup} showPopup={showPopup} /> */}
        <div className="mx-auto px-4 py-8 sm:px-6 lg:px-12 lg:pr-8 lg:pt-6">
          <Routes>
            <Route path="/" element={<Navigate to="/clients" />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clientUsers" element={<ClientUsers />} />
            <Route path="/userModules" element={<UserModules />} />
            <Route path="/userspardetails" element={<UserSparDetails />} />
            <Route path="/clientModules" element={<ClientModules />} />
            <Route path="/all-modules" element={<AllModules />} />
            <Route path="/create-module" element={<CreateModule />} />
            <Route path="/createAvatar" element={<CreateAvatar />} />
            <Route path="/assign-modules" element={<AssignModules />} />
            <Route
              path="/clientModuleDetail"
              element={<ClientModuleDetail />}
            />
            <Route path="/add-objective" element={<AddObjective />} />
            <Route path="/my-stats" element={<MyStats />} />
            <Route path="/changes" element={<Changes />} />
            <Route path="/users" element={<AllUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Layout;
