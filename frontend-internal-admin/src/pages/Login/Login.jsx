import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../component/Loader/Loader";
import Button from "../../component/Button/Button";
import { showToast } from "../../../src/utils/showToast";
import { useDispatch, useSelector } from "react-redux";
import assets from "../../constants/assets";
import { postLoginDetails } from "../../../store/thunk/authThunk";

import _ from "lodash";
const Login = () => {
  let navigateTo = useNavigate();
  const dispatch = useDispatch();
  // const users = useSelector((state) => state.commonReducer.loginDetails);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [error, setError] = useState({
    userName: "",
    password: "",
  });
  const [inputValue, setInputValue] = useState({
    userName: "",
    password: "",
  });

  const setPassword = (e) => {
    setShowPassword(e);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInputValue) => ({
      ...prevInputValue,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigateTo("/clients");
    } else navigateTo("/login");
  }, [isAuthenticated, navigateTo]);

  const handleValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;

    if (!inputValue.userName) {
      formIsValid = false;
      newErrorsState.userName = "Username is required!";
      // showToast("Username is required!", "error");
    } else {
      newErrorsState.userName = "";
    }
    if (!inputValue.password) {
      formIsValid = false;
      newErrorsState.password = "Password is required!";
      // showToast("Password is required!", "error");
    } else {
      newErrorsState.password = "";
    }
    if (
      newErrorsState.userName !== "" ||
      (newErrorsState.password !== "" && !formIsValid)
    ) {
      showToast("Error!....Check your Name and Password", "error");
    }

    if (!formIsValid) {
      setError(newErrorsState);
      return;
    }
    dispatch(postLoginDetails(inputValue))
      .then((res) => {
        if (res?.payload?.status === 200) {
          console.log("login successful");
          setError({});
        } else if (res?.payload) {
          console.log("error login", res?.payload);
          //  if (res?.payload ==="User not found") {
          if (res?.payload === `User not found: ${inputValue.userName}`) {
            newErrorsState.userName = res?.payload;
            setError(newErrorsState);
          } else {
            newErrorsState.password = "Invalid password";
            setError(newErrorsState);
          }
        }
      })
      .catch((error) => {
        console.log("login error response", error);
        newErrorsState.login = "An unexpected error occurred.";
        setError(newErrorsState);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleValidation();
  };

  return (
    <div className="relative h-full overflow-auto flex justify-center items-center bg-img text-red-50 w-full login">
      <div className="bg-blur-img">
        <img
          src={assets.BlurImg}
          alt=""
          className="absolute -translate-x-2/4 -translate-y-2/4 max-w-full max-h-full left-2/4 top-2/4"
        />
      </div>
      {isLoader ? (
        <Loader />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="relative flex w-[90%]  max-w-[400px] flex-col gap-8 items-center text-center py-12 px-10 rounded-3xl custom-box border border-solid border-[#474747]">
            <div className="w-28 h-28 bg-black rounded-full bg-logo-img"></div>
            <div className="flex flex-col gap-4">
              <span className="font-montserrat text-primary font-bold text-base leading-4 ">
                Welcome Admin!
              </span>
              <div className={`form-filed ${error.userName ? "error" : ""}`}>
                <div className="relative">
                  <input
                    type="text"
                    name="userName"
                    value={inputValue.userName}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className={`w-80 h-12 bg-bgInput border rounded-3xl p-[14px] ${
                      inputValue.userName.trim()
                        ? "border-primary  font-montserrat font-medium"
                        : "border-grey500 bg-bgInput"
                    } focus:outline-none focus:border-primary transition`}
                  />
                </div>
                {error.userName ? (
                  <p className="error text-left text-error font-normal text-xs mt-1">
                    {error.userName}
                  </p>
                ) : (
                  ""
                )}
                {/* {error.user ? (
                  <p className="error text-left text-error font-normal text-xs mt-1">
                    {error.user}
                  </p>
                ) : (
                  ""
                )} */}
              </div>

              <div
                className={`form-filed ${error.password ? "error" : ""}`}
                // || error.credentials ?
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={inputValue.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className={`w-80 h-12 bg-transparent border rounded-3xl p-[14px] ${
                      inputValue.password.trim()
                        ? "border-primary"
                        : "border-grey500"
                    } focus:outline-none focus:border-primary transition`}
                  />
                  <button
                    type="button" // Changed type to "button"
                    className="absolute top-1/2 right-4 -translate-y-1/2"
                    onClick={() => setPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <img src={"./src/assets/hide.svg"} alt="" />
                    ) : (
                      <img src={"./src/assets/eye-show.svg"} alt="" />
                    )}
                  </button>
                </div>
                {error.password ? (
                  <p className="error text-left text-error font-normal text-xs mt-1">
                    {error.password}
                  </p>
                ) : (
                  ""
                )}

                {/* {error.credentials ? (
                  <p className="error text-left text-error font-normal text-xs mt-1">
                    {error.credentials}
                  </p>
                ) : (
                  ""
                )} */}
              </div>

              <span className="underline text-xs cursor-pointer">
                Forgotten password?
              </span>
            </div>

            <Button type="submit" className="btn btn-gradient">
              Login
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
