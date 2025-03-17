import React, { useState } from "react";
import Button from "../../component/Button/Button";
import assets from "../../constants/assets";
// import { getuserProfileData } from "../../../store/thunk/commonThunk";
import { useSelector } from "react-redux";

const Profile = () => {
  // const dispatch = useDispatch();

  const userProfileData = useSelector((state) => state.auth.userProfileData);
  // console.log("user data Profile page: ", userProfileData);

  const [edit, setEdit] = useState(false);
  const [error, setError] = useState({
    last_name: "",
    first_name: "",
    job_title: "",
  });
  const [inputValue, setInputValue] = useState({
    last_name: userProfileData?.last_name || "",
    first_name: userProfileData?.first_name || "",
    job_title: userProfileData?.job_title || "",
  });

  const handleValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    if (!inputValue.last_name) {
      formIsValid = false;
      newErrorsState.last_name = "Last name is required!";
    } else {
      formIsValid = true;
      newErrorsState.last_name = "";
    }
    if (!inputValue.first_name) {
      formIsValid = false;
      newErrorsState.first_name = "Surname is required!";
    } else {
      formIsValid = true;
      newErrorsState.first_name = "";
    }
    if (!inputValue.job_title) {
      formIsValid = false;
      newErrorsState.job_title = "Job title is required!";
    } else {
      formIsValid = true;
      newErrorsState.job_title = "";
    }
    if (formIsValid == false) {
      setError(newErrorsState);
      return true;
    } else {
      // dispatch(postLoginDetails(inputValue))
      //   .then((res) => {
      //     if (res?.payload?.status === 200) {
      //       if (
      //         location?.state?.from?.pathname &&
      //         location?.state?.from?.search
      //       ) {
      //         // console.log('check', location);
      //         const from = location.state?.from?.pathname || "/home";
      //         const searchParams = location.state?.from?.search || "";
      //         console.log(
      //           "Login success, navigating to:",
      //           `${from}${searchParams}`
      //         );
      //         navigate(`${from}${searchParams}`, { replace: true });
      //       }
      //     }
      //   })
      //   .catch(() => {
      //     console.log(error);
      //   });
      setError(newErrorsState);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleValidation();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInputValue) => ({
      ...prevInputValue,
      [name]: value,
    }));
  };
  return (
    <div className="w-full max-w-[100%] mx-auto px-4">
      <div className="w-full max-w-[1497px] mx-auto h-[714.87px] flex flex-grow justify-center gap-[24px] md:gap-[32px] lg:gap-[56px] opacity-100">
        {!edit ? (
          <div className="custom-box flex-shrink-0 flex-grow basis-[100%] md:basis-[48%] lg:basis-[30%] max-w-[482px] h-auto flex flex-col px-6 py-8 rounded-[24px] custom-border bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)]">
            <div className="w-full flex justify-end">
              <Button
                onClick={() => setEdit(!edit)}
                className="btn btn-gradient-edit"
              >
                Edit profile
              </Button>
            </div>
            <div className="flex flex-col justify-center items-center mt-6 w-full">
              <img
                loading="lazy"
                src={assets.HeaderProfileImage}
                alt="User avatar"
                className="self-center border rounded-full border-green-300 w-[110px] h-[110px]"
              />
              <div className="flex flex-col justify-center items-center mt-2 w-full">
                <span className="text-[24px] font-montserrat font-semibold leading-[41px] text-white">
                  {userProfileData?.first_name} {userProfileData?.last_name}
                </span>
                <span className="mt-1 text-[12px] font-montserrat font-light leading-[14.63px] text-white">
                  {/* In store seller - FR */}
                </span>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center px-6 py-8 mt-6 custom-box custom-border w-full h-[92px] rounded-3xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border  text-white">
              <div className="tracking-[1px] font-montserrat font-medium leading-[12.87px]">
                Average collected stars
              </div>
              <div className="flex flex-row w-[68px] justify-between">
                <span className="font-montserrat text-[36px] text-primary font-extrabold leading-[43.88px] tracking-[0.01em] text-left">
                  11
                </span>
                <img
                  loading="lazy"
                  src={assets.starActive}
                  alt="User avatar"
                  className="self-center w-[30px] h-[30px]"
                />
              </div>
            </div>
            <div className="flex flex-row justify-between items-center px-6 py-8 mt-2 custom-box custom-border w-full h-[92px] rounded-3xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border  text-white">
              <div className="tracking-[1px] font-montserrat font-medium leading-[12.87px]">
                Completed modules
              </div>
              <div className="flex flex-row w-[78px] justify-between">
                <span className="font-montserrat text-[36px] text-primary font-extrabold leading-[43.88px] tracking-[0.01em] text-left">
                  16
                </span>
                <img
                  loading="lazy"
                  src={assets.tickCircle}
                  alt="User avatar"
                  className="self-center w-[30px] h-[30px]"
                />
              </div>
            </div>
            <div className="mt-4 custom-box custom-border w-full h-[220.87px] px-6 py-8 rounded-3xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border  text-white">
              <div className="tracking-[1px] font-montserrat font-medium leading-[12.87px]">
                Progression
              </div>
            </div>
          </div>
        ) : (
          <div className="custom-box flex-shrink-0 flex-grow basis-[100%] md:basis-[48%] lg:basis-[30%] max-w-[482px] h-[714px] flex flex-col px-6 py-8 rounded-[24px] custom-border bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)]">
            <div className="w-full flex justify-end">
              <Button
                onClick={() => setEdit(!edit)}
                className="btn btn-gradient-edit"
              >
                Edit profile
              </Button>
            </div>
            <div className="flex flex-col justify-center items-center mt-6 w-full">
              <img
                loading="lazy"
                src={assets.HeaderProfileImage}
                alt="User avatar"
                className="self-center border rounded-full border-green-300 w-[110px] h-[110px]"
              />
              <div className="flex flex-col justify-center items-center mt-2 w-full">
                <span className="text-[24px] font-montserrat font-semibold leading-[41px] text-white">
                  Sebastien Sedan
                </span>
                <span className="mt-1 text-[12px] font-montserrat font-light leading-[14.63px] text-white">
                  In store seller - FR
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center mt-6 w-full">
              <form
                onSubmit={handleSubmit}
                className="flex w-full sm:w-[473px] flex-col items-center justify-center sm:px-10"
              >
                <div className="">
                  <div
                    className={`form-filed ${error.last_name ? "error" : ""}`}
                  >
                    <div className="relative">
                      <span className="ml-[10px] font-montserrat text-[12px] text-primary leading-[12.87px] tracking-[0.01em] font-bold ">
                        Last name
                      </span>
                      <input
                        type="text"
                        name="last_name"
                        value={inputValue.last_name}
                        onChange={handleInputChange}
                        placeholder="Lastname"
                        className={`w-full sm:w-96 h-14 bg-transparent text-white border rounded-3xl p-[14px] ${
                          inputValue.last_name.trim()
                            ? "border-primary"
                            : "border-grey500"
                        } focus:outline-none focus:border-primary transition`}
                      />
                    </div>
                    {error.last_name ? (
                      <p className="error text-left text-[#F75632] font-normal text-xs mt-1">
                        {error.last_name}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>

                  <div
                    className={`form-filed ${error.first_name ? "error" : ""}`}
                  >
                    <div className="relative mt-2">
                      <span className="ml-[10px] font-montserrat text-[12px] text-primary leading-[12.87px] tracking-[0.01em] font-bold ">
                        Sur name
                      </span>
                      <input
                        type={"text"}
                        name="first_name"
                        value={inputValue.first_name}
                        onChange={handleInputChange}
                        placeholder="SurName"
                        className={`w-full sm:w-96 h-14 text-white bg-transparent border rounded-3xl p-[14px] ${
                          inputValue.first_name.trim()
                            ? "border-primary"
                            : "border-grey500"
                        } focus:outline-none focus:border-primary transition`}
                      />
                    </div>
                    {error.first_name ? (
                      <p className="error text-left text-[#F75632] font-normal text-xs mt-1">
                        {error.first_name}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                  <div
                    className={`form-filed ${error.job_title ? "error" : ""}`}
                  >
                    <div className="relative mt-2">
                      <span className="ml-[10px] font-montserrat text-[12px] text-primary leading-[12.87px] tracking-[0.01em] font-bold ">
                        Job title
                      </span>
                      <input
                        type={"text"}
                        name="job_title"
                        value={inputValue.job_title}
                        onChange={handleInputChange}
                        placeholder="Job title"
                        className={`w-full sm:w-96 mt-1 text-white h-14 bg-transparent border rounded-3xl p-[14px] ${
                          inputValue.job_title.trim()
                            ? "border-primary"
                            : "border-grey500"
                        } focus:outline-none focus:border-primary transition`}
                      />
                    </div>
                    {error.job_title ? (
                      <p className="error text-left text-[#F75632] font-normal text-xs mt-1">
                        {error.job_title}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="flex flex-row w-full justify-center items-center mt-9">
                  <Button type="submit" className="btn btn-gradient-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" className="btn btn-gradient-save ml-3">
                    Save profile
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className=" flex-shrink-0 flex-grow basis-[100%] md:basis-[48%] lg:basis-[30%] max-w-[482px] h-[714.87px] flex flex-col rounded-[24px] border custom-border p-8 bg-[#464646]">
          <div className="flex justify-center h-[650.87px] items-center flex-col pb-[50px] self-stretch bg-[#2C2C2C] border border-[#434343] rounded-2xl aspect-[0.311]">
            <span className="font-montserrat text-[24px] text-[#434343] font-extrabold leading-[29.26px] tracking-[0.01em] text-left">
              Wall of fame
            </span>
            <img
              loading="lazy"
              src={assets.multiStars}
              alt="User avatar"
              className="self-center w-[132.87px] h-[132.87px] mt-6"
            />
            <Button className="bg-[#19DBAD] px-3 py-2 text-[11px] font-bold text-[#292929] rounded-[34px]">
              Coming soon
            </Button>
          </div>
        </div>
        <div className=" flex-shrink-0 flex-grow basis-[100%] md:basis-[48%] lg:basis-[30%] max-w-[482px] h-[714.87px] flex flex-col rounded-[24px] border custom-border p-8 bg-[#464646]">
          <div className="flex justify-center h-[650.87px] items-center flex-col pb-[50px] self-stretch bg-[#2C2C2C] border border-[#434343] rounded-2xl ">
            <span className="font-montserrat text-[24px] text-[#434343] font-extrabold leading-[29.26px] tracking-[0.01em] text-left">
              Leaderboard
            </span>
            <img
              loading="lazy"
              src={assets.bars}
              alt="User avatar"
              className="self-center w-[132.87px] h-[132.87px] mt-6"
            />
            <Button className="bg-[#19DBAD] px-3 py-2 text-[11px] font-bold text-[#292929] rounded-[34px]">
              Coming soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
