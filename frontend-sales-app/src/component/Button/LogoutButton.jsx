import React from "react";
import assets from "../../constants/assets";
import { getLogoutUser } from "../../../store/thunk/authThunk";
import { useDispatch } from "react-redux";

function LogoutButton() {
  const dispatch = useDispatch();
  return (
    <div className="flex gap-1 z-50  justify-center items-center px-6 py-4 text-xs leading-3 border-t border-solid border-[#FFFFFF33] text-white">
      <img
        loading="lazy"
        src={assets.logout}
        alt=""
        className="shrink-0 my-auto w-7 h-7"
        onClick={() => {
          dispatch(getLogoutUser());
          navigate("/login");
        }}
      />
    </div>
  );
}

export default LogoutButton;
