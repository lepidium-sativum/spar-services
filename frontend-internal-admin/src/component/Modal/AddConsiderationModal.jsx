import React, { useState, useMemo } from "react";
import Button from "../Button/Button";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../utils/showToast";

function AddConsiderationModal({ onSubmit, onClose }) {
  const dispatch = useDispatch();

  const [error, setError] = useState({
    consideration: "",
  });
  const [inputValue, setInputValue] = useState({
    consideration: "",
  });

  const handleValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    if (!inputValue.consideration) {
      formIsValid = false;
      newErrorsState.consideration = "Consideration  is required!";
    } else {
      newErrorsState.consideration = "";
    }
    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Consideration  is required!", "error");
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
            Add a new Consideration
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className=" flex w-full flex-col justify-center items-center  ">
            <div className="flex flex-col w-1/2 mb-2 form-filed ">
              <h4 className="mb-2">Consideration</h4>
              <div
                className={`flex w-full ${error.consideration ? "error" : ""}`}
              >
                <input
                  type="text"
                  name="consideration"
                  value={inputValue.consideration}
                  onChange={handleInputChange}
                  placeholder="consideration....."
                  className={`w-full h-12 bg-[rgb(89,89,89)]  border rounded-md p-[14px] ${
                    inputValue.consideration.trim()
                      ? "border-primary font-montserrat font-medium"
                      : "border-grey500 bg-bgInput"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.consideration ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.consideration}
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
export default AddConsiderationModal;
