// AppRouter.js
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "../pages/Login";
import Layout from "../layout/Layout";
import PrivateRoute from "../../config/PrivateRoute";
import { useSelector } from "react-redux";
import Module from "../pages/Module/Module";
import NotFound from "../pages/404";
import Home from "../pages/Home/Home";
import AllModules from "../pages/Module/AllModules";
import MyReports from "../pages/Reports/MyReports";
import SparReport from "../pages/Reports/SparReport";
import Profile from "../pages/Profile/Profile";
import NewReport from "../pages/Reports/NewReport";
// Define all routes here, including protected routes
const AppRouter = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const tokenExists = Boolean(localStorage.getItem("token"));

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <PrivateRoute isAuthenticated={isAuthenticated || tokenExists}>
          <Layout />
        </PrivateRoute>
      ),
      children: [
        { path: "/", element: <Navigate to="/home" replace /> },
        { path: "/home", element: <Home /> },
        { path: "/module", element: <Module /> },
        { path: "/allmodules", element: <AllModules /> },
        { path: "/myreports", element: <MyReports /> },
        { path: "/sparreport", element: <SparReport /> },
        { path: "/profile", element: <Profile /> },
        { path: "*", element: <NotFound /> },
        { path: "/newreport", element: <NewReport /> },
      ],
    },
    {
      path: "/login",
      element:
        isAuthenticated || tokenExists ? <Navigate to="/home" /> : <Login />,
    },
  ]);

  return (
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  );
};

export default AppRouter;
