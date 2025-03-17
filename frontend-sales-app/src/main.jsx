import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "../store/store.js";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick={false}
      closeButton={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      theme="colored"
      className="Toastify__toast-theme--colored"
      transition:Zoom
      style={{
        fontWeight: "600",
        width: "700px",
        height: "60px !important",
        fontSize: "16px",
        textAlign: "center",
        borderRadius: "30px",
      }}
    />
  </Provider>
  // </React.StrictMode>
);
