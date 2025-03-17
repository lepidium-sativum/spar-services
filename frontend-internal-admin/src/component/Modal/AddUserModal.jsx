import React, { useState } from "react";
import Button from "../Button/Button";
import _ from "lodash";
import { useDispatch } from "react-redux";
import { createClientUser } from "../../../store/thunk/commonThunk";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/showToast";

function AddUserModal({ onClose, client_id }) {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();
  const [error, setError] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [inputValue, setInputValue] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    const usernameHasSpace = /\s/.test(inputValue.username);
    const usernameHasSpecialCharacters = /[^a-zA-Z0-9]/.test(
      inputValue.username
    );
    if (!inputValue.username) {
      formIsValid = false;
      newErrorsState.username = "User name is required!";
      showToast("User name is required!", "error");
    } else if (usernameHasSpace) {
      formIsValid = false;
      newErrorsState.username = "User name cannot contain spaces!";
      showToast("User name cannot contain spaces!", "error");
    } else if (usernameHasSpecialCharacters) {
      formIsValid = false;
      newErrorsState.username =
        "User name can only contain letters and numbers!";
      showToast("User name can only contain letters and numbers!", "error");
    } else {
      newErrorsState.username = "";
    }

    if (!inputValue.first_name) {
      formIsValid = false;
      newErrorsState.first_name = "First Name is required!";
    } else {
      // formIsValid = true;
      newErrorsState.first_name = "";
    }
    if (!inputValue.last_name) {
      formIsValid = false;
      newErrorsState.last_name = "Last Name is required!";
    } else {
      // formIsValid = true;
      newErrorsState.last_name = "";
    }
    if (!inputValue.email) {
      formIsValid = false;
      newErrorsState.email = "Email is required!";
    } else {
      // formIsValid = true;
      newErrorsState.email = "";
    }
    if (!inputValue.password) {
      formIsValid = false;
      newErrorsState.password = "Password is required!";
    } else {
      // formIsValid = true;
      newErrorsState.password = "";
    }

    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Required fields are empty!", "error");
      return true;
    }
    console.log("form: ", inputValue);
    let data = _.extend(inputValue, { client_id });

    //   "client_id": 3,

    dispatch(createClientUser(data))
      .then((res) => {
        if (res?.payload?.status === 200) {
          // console.log("user created successful");
          setError({});
          onClose();
          navigateTo(`/clientUsers?clientId=${client_id}`);
        }
      })
      .catch((error) => {
        console.log("error response", error);
        newErrorsState.login = "An unexpected error occurred.";
        setError(newErrorsState);
      });
    setError(newErrorsState);
  };

  const handleSubmit = (e) => {
    console.log("handlesubmit");
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
  //text-[#1A1A1A] bg-[#EEEEEE]
  return (
    <div className="z-50 fixed inset-0 flex max-w-full justify-center h-full bg-opacity-15 backdrop-blur-sm add-user-modal">
      <div className="mt-5 mb-5  rounded-xl w-3/4 h-11/12 text-[rgb(231,231,231)] bg-[#333333] flex flex-col  gap-3 mx-4 overflow-auto p-2 hide-scrollbar">
        <div className="flex justify-end w-full h-20">
          <button
            className="mr-7 mt-3 font-extrabold"
            onClick={() => onClose()}
          >
            X
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h3 className="text-xl mt-5 font-montserrat text-white font-bold dark:text-white">
            Add a new User
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex w-full flex-col justify-center items-center">
            <div className={"flex flex-col w-1/2 mb-2 form-filed"}>
              <h4 className="mb-2">First Name</h4>
              <div
                className={`flex w-full ${error.first_name ? "error" : ""} `}
              >
                <input
                  type="text"
                  name="first_name"
                  value={inputValue.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter your First Name"
                  className={`w-full h-10 bg-[rgb(89,89,89)] border-[#EAECF0]  border rounded-md p-[10px] ${
                    inputValue.first_name.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.first_name ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.first_name}
                </p>
              ) : (
                ""
              )}
            </div>
            <div className="flex flex-col w-1/2 mb-2 form-filed">
              <h4 className="mb-2">Last Name</h4>
              <div className={`flex w-full ${error.last_name ? "error" : ""}`}>
                <input
                  type="text"
                  name="last_name"
                  value={inputValue.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter your Last Name"
                  className={`w-full h-10 bg-[rgb(89,89,89)] border-[#EAECF0] border rounded-md p-[10px] ${
                    inputValue.last_name.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.last_name ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.last_name}
                </p>
              ) : (
                ""
              )}
            </div>
            <div className={"flex flex-col w-1/2 mb-2 form-filed "}>
              <h4 className="mb-2">Email</h4>
              <div className={`flex w-full ${error.email ? "error" : ""} `}>
                <input
                  type="text"
                  name="email"
                  value={inputValue.email}
                  onChange={handleInputChange}
                  placeholder="Sephora"
                  className={`w-full h-10 bg-[rgb(89,89,89)] border-[#EAECF0] border rounded-md p-[10px] ${
                    inputValue.email.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.email ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.email}
                </p>
              ) : (
                ""
              )}
            </div>
            <div className="flex flex-col w-1/2 mb-2 form-filed">
              <h4 className="mb-2">User Name</h4>
              <div className={`flex w-full ${error.username ? "error" : ""} `}>
                <input
                  type="text"
                  name="username"
                  value={inputValue.username}
                  onChange={handleInputChange}
                  placeholder="Sephora"
                  className={`w-full h-10 bg-[rgb(89,89,89)] border-[#EAECF0] border rounded-md p-[10px] ${
                    inputValue.username.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.username ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.username}
                </p>
              ) : (
                ""
              )}
            </div>
            <div className={"flex flex-col w-1/2 mb-2 form-filed"}>
              <h4 className="mb-2">Password</h4>
              <div className={`flex w-full ${error.password ? "error" : ""} `}>
                <input
                  type="password"
                  name="password"
                  value={inputValue.password}
                  onChange={handleInputChange}
                  placeholder="Sephora"
                  className={`w-full h-10 bg-[rgb(89,89,89)] border-[#EAECF0] border rounded-md p-[10px] ${
                    inputValue.password.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.password ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.password}
                </p>
              ) : (
                ""
              )}
            </div>
          </div>

          <div className="flex justify-center items-center mt-3">
            <Button
              //   onClick={onClose}
              type="submit"
              className="btn btn-gradient-blue "
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AddUserModal;
