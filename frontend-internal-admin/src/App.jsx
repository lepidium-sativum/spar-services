// import { init as initApm } from '@elastic/apm-rum'
// import config from "../config/config";
// const apm = initApm({
//   serviceName: 'sales-app',
//   serverUrl: config.APM_SERVER_URL,
//   serviceVersion: '0.0.1'
// })

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/Login";
import Layout from "./layout/Layout";
import { useSelector } from "react-redux";
import { useEffect } from "react";


function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/calling") {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Layout />} />
     </Routes>
   
       </>   
  );
}

export default App;
