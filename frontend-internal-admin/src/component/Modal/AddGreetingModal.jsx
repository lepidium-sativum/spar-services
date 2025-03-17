import React, { useState } from "react";
import Button from "../Button/Button";
import { showToast } from "../../utils/showToast";

function AddGreetingModal({ onSubmit, onClose }) {
  const [error, setError] = useState({
    greeting: "",
  });
  const [inputValue, setInputValue] = useState({
    greeting: "",
  });

  const handleValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    if (!inputValue.greeting) {
      formIsValid = false;
      newErrorsState.greeting = "Greeting  is required!";
    } else {
      newErrorsState.greeting = "";
    }
    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Greeting  is required!", "error");
      return false;
    }
    console.log("form: ", inputValue);
    setError(newErrorsState);
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      onSubmit(inputValue);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInputValue) => ({
      ...prevInputValue,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 flex max-w-full justify-center h-full bg-opacity-15 backdrop-blur-sm add-user-modal">
      <div className="mt-10 mb-10 text-[rgb(231,231,231)] bg-[#666666] rounded-xl w-3/4 h-4/5  flex flex-col  gap-5 mx-4 overflow-auto p-5 hide-scrollbar">
        <div className="flex justify-end w-full h-20">
          <button
            className="mr-7 mt-5 font-extrabold"
            onClick={() => onClose()}
          >
            X
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h3 className="text-xl mt-10 font-montserrat text-white font-bold dark:text-white">
            Add a new Greeting
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className=" flex w-full flex-col justify-center items-center  ">
            <div className="flex flex-col w-1/2 mb-2 form-filed ">
              <h4 className="mb-2">Greeting message</h4>
              <div className={`flex w-full ${error.greeting ? "error" : ""} `}>
                <input
                  type="text"
                  name="greeting"
                  value={inputValue.greeting}
                  onChange={handleInputChange}
                  placeholder="Greeting text....."
                  className={`w-full h-12 bg-[rgb(89,89,89)]  border rounded-md p-[14px] ${
                    inputValue.greeting.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500 bg-bgInput"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.greeting ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.greeting}
                </p>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="flex flex-col mt-8 mb-5 justify-center items-center">
            <Button
              //   onClick={onClose}
              type="submit"
              className="btn btn-gradient-blue "
            >
              Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AddGreetingModal;
