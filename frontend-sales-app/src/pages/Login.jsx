import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginLoader from "../component/Loader/LoginLoader";
import Button from "../component/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { postLoginDetails } from "../../store/thunk/authThunk";

const Login = () => {
  let navigateTo = useNavigate();
  const dispatch = useDispatch();
  // const location = useLocation();

  // const loginUsers = useSelector((state) => state.sliceReducer.getLoginUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  console.log("login page: ", isAuthenticated);

  const loader = useSelector((state) => state.commonReducer.loader);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({
    userName: "",
    password: "",
  });
  const [inputValue, setInputValue] = useState({
    username: "",
    password: "",
  });
  // console.log("login useEffect ", location?.state?.from?.pathname,location?.state?.from?.search);

  const setPassword = (e) => {
    setShowPassword(e);
  };
  useEffect(() => {
    console.log("login page");
    if (isAuthenticated) {
      navigateTo("/home");
    } else navigateTo("/login");
  }, [isAuthenticated, navigateTo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInputValue) => ({
      ...prevInputValue,
      [name]: value,
    }));
  };

  const handleValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    if (!inputValue.username) {
      formIsValid = false;
      newErrorsState.userName = "Username is required!";
    } else {
      formIsValid = true;
      newErrorsState.userName = "";
    }
    if (!inputValue.password) {
      formIsValid = false;
      newErrorsState.password = "Password is required!";
    } else {
      formIsValid = true;
      newErrorsState.password = "";
    }
    if (formIsValid == false) {
      setError(newErrorsState);
      return true;
    } else {
      dispatch(postLoginDetails(inputValue));
      // .then((res) => {
      //   if (res?.payload?.status === 200) {
      //     if (
      //       location?.state?.from?.pathname &&
      //       location?.state?.from?.search
      //     ) {
      //       // console.log('check', location);
      //       const from = location.state?.from?.pathname || "/home";
      //       const searchParams = location.state?.from?.search || "";
      //       console.log(
      //         "Login success, navigating to:",
      //         `${from}${searchParams}`
      //       );
      //       navigateTo(`${from}${searchParams}`, { replace: true });
      //     }
      //   }
      // })
      // .catch(() => {
      //   console.log(error);
      // });
      setError(newErrorsState);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleValidation();
  };

  return (
    <>
      <div className="min-h-screen fixed h-screen py-8 flex flex-1 max-w-full overflow-auto flex-col justify-center items-center bg-[#171717] bg-img text-red-50 w-full custom-scrollbar ">
        {loader ? (
          <LoginLoader />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full sm:w-[473px] flex-col gap-8 items-center justify-center text-center border py-12 px-5 sm:px-10 mx-auto mt-2 rounded-3xl custom-box"
          >
            <div className="w-28 h-28 bg-black rounded-full bg-logo-img"></div>
            <div className="flex flex-col gap-2">
              <span>Prototype</span>
              <span className="text-xl font-bold primary">
                Welcome on board!
              </span>
            </div>

            <div className="flex flex-col gap-6 w-full login">
              <div className={`form-filed ${error.userName ? "error" : ""}`}>
                <div className="relative ">
                  <input
                    type="text"
                    name="username"
                    value={inputValue.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className={`w-full sm:w-96 h-14  border rounded-3xl p-[14px] ${
                      inputValue.username.trim()
                        ? "border-primary"
                        : "border-grey500"
                    } focus:outline-none focus:border-primary transition`}
                  />
                </div>
                {error.userName ? (
                  <p className="error text-left text-[#F75632] font-normal text-xs mt-1">
                    {error.userName}
                  </p>
                ) : (
                  ""
                )}
              </div>

              <div className={`form-filed ${error.password ? "error" : ""}`}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={inputValue.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className={`w-full sm:w-96 h-14 bg-transparent border rounded-3xl p-[14px] ${
                      inputValue.password.trim()
                        ? "border-primary"
                        : "border-grey500"
                    } focus:outline-none focus:border-primary transition`}
                  />
                  <button
                    className="absolute top-1/2 right-4 -translate-y-1/2"
                    onClick={() => setPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? (
                      <img src={"./src/assets/hide.svg"} alt="" />
                    ) : (
                      <img src={"./src/assets/eye-show.svg"} alt="" />
                    )}
                  </button>
                </div>
                {error.password ? (
                  <p className="error text-left text-[#F75632] font-normal text-xs mt-1">
                    {error.password}
                  </p>
                ) : (
                  ""
                )}
              </div>

              <span className="underline text-xs cursor-pointer">
                Forgotten password?
              </span>
            </div>
            <Button type="submit" className="btn btn-gradient w-36 ">
              Login
            </Button>
          </form>
        )}
      </div>
    </>
  );
};

export default Login;
