import React from "react";
import assets from "../../constants/assets";
import { useNavigate } from "react-router-dom";
function UserProfile({ data }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/profile", { state: { data } })}
      className="cursor-pointer user-profile flex flex-col bg-[linear-gradient(128.49deg,#323232_0%,#292424_100%)] z-50 shadow-[20px_0px_44px_0px_rgba(0,0,0,0.25)] self-stretch w-[200px] h-[125px] font-semibold text-white border-t border-solid border-t-stone-500 hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out"
    >
      <div className="flex justify-end mt-3 mr-3">
        <img
          loading="lazy"
          src={assets.setting}
          alt="User avatar"
          className="ml-10 w-[16px] h-[16px] icon cursor-pointer transition-transform duration-200 hover:scale-110"
        />
      </div>
      <div className="flex flex-col justify-center items-center w-full">
        <img
          loading="lazy"
          src={assets.HeaderProfileImage}
          alt="User avatar"
          className="self-center border rounded-full border-green-300 w-[52px] h-[52px]"
        />
        <div className="mt-3 text-[14px] font-montserrat font-semibold leading-[12.87px] text-white ">
          {data?.first_name} {data?.last_name}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
