import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "../store/store.js";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Zoom } from "react-toastify";
import { BrowserRouter as Router } from "react-router-dom";
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Router>
      <App />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        closeButton={false}
        // closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="colored"
        transition:Zoom
        className="Toastify__toast-theme--colored"
        style={{
          fontWeight: "600",
          width: "700px",
          height: "60px !important",
          fontSize: "16px",
          textAlign: "center",
          borderRadius: "30px",
        }}
      />
      {/* Same as */}
    </Router>
  </Provider>
);
