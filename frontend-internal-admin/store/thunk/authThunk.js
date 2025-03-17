import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiUser from "../../config/apiUser";
import { showToast } from "../../src/utils/showToast";
import { getLogout, loginUser } from "../slices/authSlice";
import { setLoader } from "../slices/commonSlice";
import { jwtDecode } from "jwt-decode";

export const postLoginDetails = createAsyncThunk(
  "postLoginDetails",
  async (_request, { dispatch, rejectWithValue }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().post("auth/tokens", {
        username: _request?.userName,
        password: _request?.password,
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        const decodeJwt = jwtDecode(response?.data?.access_token);
        if (decodeJwt.role === "admin") {
          localStorage.setItem(
            "token",
            JSON.stringify(response?.data?.access_token)
          );
          showToast("Login successfully", "success");
          dispatch(loginUser(response?.data || {}));
          return response;
        } else {
          showToast("You are not allowed to login", "error");
          return rejectWithValue("You are not allowed to login");
        }
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      return rejectWithValue(error?.response?.data?.detail || error.message);
    }
  }
);
export const getLogoutUser = () => (dispatch) => {
  dispatch(getLogout(false));
  localStorage.removeItem("token");
};
