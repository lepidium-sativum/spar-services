import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isAuthenticated: null,
  getLoginUser: null,
};

export const authSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    getLogout: (state, action) => ({
      ...state,
      isAuthenticated: action.payload,
    }),
    loginUser: (state, action) => ({
      ...state,
      getLoginUser: action.payload,
      isAuthenticated: true,
    }),
  },
});

export const { getLogout, loginUser } = authSlice.actions;

export default authSlice.reducer;
