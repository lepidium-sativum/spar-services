import React, { useState, useMemo } from "react";
import Button from "../Button/Button";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { createPersonality } from "../../../store/thunk/commonThunk";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/showToast";
// import config from "./config.json";

function AddPersonalityModal({ onClose }) {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();

  const [selectedColour, setSelectedColour] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [description, setDescription] = useState("");
  const [instruction, setInstruction] = useState("");

  const handleChange = (event) => {
    setDescription(event.target.value);
  };
  const handleChangeInst = (event) => {
    setInstruction(event.target.value);
  };
  const handleDescriptionInput = (event) => {
    // Auto-resize the textarea based on content
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };
  const handleInstructionInput = (event) => {
    // Auto-resize the textarea based on content
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };
  const [error, setError] = useState({
    name: "",
    // description: "",
    personality_info: "",
    // instructions: "",
    // style: "",
    model: "",
    // temperature: "",
    // url: "",
    // type: "",
  });
  const [inputValue, setInputValue] = useState({
    name: "",
    description: "",
    personality_info: "",
    instructions: "",
    style: "",
    model: "",
    temperature: "",
    url: "",
    type: "",
    lang: "",
    voice: "",
    region: "",
    vPitch: "",
    vRate: "",
  });

  const handleValidation = () => {
    const newErrorsState = {};
    let updateInput = { ...inputValue };
    let formIsValid = true;
    if (!inputValue.name) {
      formIsValid = false;
      newErrorsState.name = "Personality name is required!";
    } else {
      formIsValid = true;
      newErrorsState.name = "";
    }

    if (!inputValue.personality_info) {
      formIsValid = false;
      newErrorsState.personality_info = "Personality Information is required!";
    } else {
      newErrorsState.personality_info = "";
    }

    if (!inputValue.model) {
      formIsValid = false;
      newErrorsState.model = "Modal is required!";
    } else {
      newErrorsState.model = "";
    }

    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Required fields are empty", "error");
      return false;
    }
    // console.log("form: ", inputValue);

    if (inputValue.temperature === "") {
      updateInput = _.omit(inputValue, "temperature");
      console.log("updateInput ", updateInput);
    }

    dispatch(createPersonality(updateInput))
      .then((res) => {
        if (res?.payload?.status === 200) {
          onClose();
          setError({});
          navigateTo("/createAvatar");
        }
      })
      .catch((error) => {
        console.log("Personality error response", error);
        newErrorsState.login = "An unexpected error occurred.";
        setError(newErrorsState);
      });
    setError(newErrorsState);
  };

  const handleSubmit = (e) => {
    // onClose();
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
  const handleChangeStyle = (event) => {
    setSelectedColour(event.target.value);
  };
  const handleChangeLanguage = (event) => {
    setSelectedLanguage(event.target.value);
  };
  const handleChangeVoice = (event) => {
    setSelectedVoice(event.target.value);
  };
  const handleChangeRegion = (event) => {
    setSelectedRegion(event.target.value);
  };
  // console.log("Colours:", selectedColour);
  // console.log("Languages:", selectedLanguage);
  // console.log("Region:", selectedRegion);
  // console.log("Voice:", selectedVoice);

  const configureData = useSelector((state) => state.commonReducer.configData);

  return (
    <div className="fixed inset-0 flex max-w-full justify-center h-full bg-opacity-15 backdrop-blur-lg add-user-modal">
      <div className="mt-10 mb-10 text-[rgb(231,231,231)] bg-[#666666] rounded-xl w-3/4 h-5/6 flex flex-col gap-0 mx-4 overflow-y-auto p-0 custom-scrollbar shadow-lg">
        <div className="flex justify-end w-full h-20">
          <button
            className="mr-7 mt-5 font-extrabold"
            onClick={() => onClose()}
          >
            X
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h3 className="text-xl mb-12 font-montserrat font-bold text-white">
            Add a new Personality
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className=" flex  w-full flex-row ">
            <div className="w-1/3 flex flex-col px-10 ">
              <div
                className="flex flex-col w-full mb-2 form-filed"
                // className={`flex flex-col w-5/6 mb-2 form-filed ${
                //   error.name ? "error" : ""
                // }`}
              >
                <h4 className="mb-2">Personality Name</h4>
                <div className={`flex w-full ${error.name ? "error" : ""}`}>
                  <input
                    type="text"
                    name="name"
                    value={inputValue.name}
                    onChange={handleInputChange}
                    placeholder="Enter name of personality"
                    className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                      inputValue.name.trim()
                        ? "border-primary  font-montserrat font-medium"
                        : "border-grey500 bg-[rgb(130,130,130)]"
                    } focus:outline-none focus:border-primary transition`}
                  />
                </div>
                {error.name ? (
                  <p className="error text-left text-error font-normal text-xs mt-1">
                    {error.name}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div
                className="flex flex-col w-full mb-2 form-filed"
                // className={`flex flex-col w-5/6 mb-2 form-filed ${
                //   error.personality_info ? "error" : ""
                // }`}
              >
                <h4 className="mb-2">Personality Information</h4>

                <div
                  className={`flex w-full ${
                    error.personality_info ? "error" : ""
                  }`}
                >
                  <input
                    type="text"
                    name="personality_info"
                    value={inputValue.personality_info}
                    onChange={handleInputChange}
                    placeholder="Personality information"
                    className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                      inputValue.personality_info.trim()
                        ? "border-primary  font-montserrat font-medium"
                        : "border-grey500 bg-[rgb(130,130,130)]"
                    } focus:outline-none focus:border-primary transition`}
                  />
                </div>
                {error.personality_info ? (
                  <p className="error text-left text-error font-normal text-xs mt-1">
                    {error.personality_info}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className={`flex flex-col w-full mb-2 form-filed `}>
                <h4 className="mb-2">Description</h4>
                <div className="flex w-full ">
                  <textarea
                    id="autoExpandTextarea"
                    value={description}
                    onChange={handleChange}
                    onInput={handleDescriptionInput} // Adjust height dynamically
                    placeholder="Description"
                    className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                      inputValue.name.trim()
                        ? "border-primary  font-montserrat font-medium"
                        : "border-grey500 bg-[rgb(130,130,130)]"
                    } focus:outline-none focus:border-primary transition`}
                    style={{
                      padding: 13,
                      resize: "none", // Disable manual resizing
                      overflow: "hidden", // Hide the scrollbars
                    }}
                  />
                </div>
                {/* <div className="flex w-full">
                  <input
                    type="text"
                    name="description"
                    value={inputValue.description}
                    onChange={handleInputChange}
                    placeholder="Personality description"
                    className={`w-full h-12 bg-white border rounded-md p-[14px] ${
                      inputValue.description.trim()
                        ? "border-primary  font-montserrat font-medium"
                        : "border-grey500 bg-bgInput"
                    } focus:outline-none focus:border-primary transition`}
                  />
                </div> */}
              </div>
              <div className={`flex flex-col w-full mb-2 form-filed`}>
                <h4 className="mb-2">Instructions</h4>

                <div className="flex w-full ">
                  <textarea
                    id="autoExpandTextarea"
                    value={instruction}
                    onChange={handleChangeInst}
                    onInput={handleInstructionInput} // Adjust height dynamically
                    placeholder="Instructions"
                    className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                      inputValue.name.trim()
                        ? "border-primary  font-montserrat font-medium"
                        : "border-grey500 bg-[rgb(130,130,130)]"
                    } focus:outline-none focus:border-primary transition`}
                    style={{
                      padding: 13,
                      resize: "none", // Disable manual resizing
                      overflow: "hidden", // Hide the scrollbars
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="w-1/3 flex flex-col px-10 ">
              <div className="w-full relative p-4 border border-[rgb(89,89,89)] rounded-md mt-4">
                <h4 className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[rgb(89,89,89)] px-2 text-lg whitespace-nowrap">
                  LLM Configuration
                </h4>
                <div className={`flex flex-col w-full mb-2 form-filed`}>
                  <h4 className="mb-2">Personality Style</h4>

                  <div className="flex w-full">
                    <select
                      name="style"
                      value={selectedColour}
                      onChange={handleChangeStyle}
                      className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[13px] ${
                        inputValue.style.trim()
                          ? "border-primary font-montserrat font-medium"
                          : "border-grey500 bg-[rgb(130,130,130)]"
                      } focus:outline-none focus:border-primary transition`}
                    >
                      <option value="" disabled>
                        Select Style
                      </option>
                      {configureData.llm_model_styles.map((style, index) => (
                        <option key={index} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={`flex flex-col w-full mb-2 form-filed `}>
                  <h4 className="mb-2">LLM Temperature</h4>

                  <div className="flex w-full">
                    <input
                      type="text"
                      name="temperature"
                      value={inputValue.temperature}
                      onChange={handleInputChange}
                      placeholder="0-1"
                      className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                        inputValue.temperature.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-grey500 bg-[rgb(130,130,130)]"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-col w-full mb-2 form-filed"
                  // className={`flex flex-col w-5/6 mb-2 form-filed ${
                  //   error.model ? "error" : ""
                  // }`}
                >
                  <h4 className="mb-2">LLM Model</h4>

                  <div className={`flex w-full  ${error.model ? "error" : ""}`}>
                    <input
                      type="text"
                      name="model"
                      value={inputValue.model}
                      onChange={handleInputChange}
                      placeholder="Model"
                      className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                        inputValue.model.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-grey500 bg-[rgb(130,130,130)]"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.model ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.model}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
                <div className={`flex flex-col w-full mb-2 form-filed `}>
                  <h4 className="mb-2">LLM URL</h4>

                  <div className="flex w-full">
                    <input
                      type="text"
                      name="url"
                      value={inputValue.url}
                      onChange={handleInputChange}
                      placeholder="URL"
                      className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                        inputValue.url.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-grey500 bg-[rgb(130,130,130)]"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                </div>
                <div className={`flex flex-col w-full mb-2 form-filed `}>
                  <h4 className="mb-2">LLM Type</h4>

                  <div className="flex w-full">
                    <input
                      type="text"
                      name="type"
                      value={inputValue.type}
                      onChange={handleInputChange}
                      placeholder="Type of LLM"
                      className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                        inputValue.type.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-grey500 bg-[rgb(130,130,130)]"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/3 flex flex-col px-10 ">
              <div className="w-full relative p-4 border border-[rgb(89,89,89)] rounded-md mt-4">
                <h4 className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[rgb(89,89,89)] px-2 text-lg whitespace-nowrap">
                  TTS Configuration
                </h4>
                <div className={`flex flex-col w-full mb-2 form-filed `}>
                  <h4 className="mb-2">Language</h4>

                  <div className="flex w-full">
                    <select
                      name="language"
                      value={selectedLanguage}
                      onChange={handleChangeLanguage}
                      className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[13px] ${
                        inputValue.lang.trim()
                          ? "border-primary font-montserrat font-medium"
                          : "border-grey500 bg-[rgb(130,130,130)]"
                      } focus:outline-none focus:border-primary transition`}
                    >
                      <option value="" disabled>
                        Select Language
                      </option>
                      {configureData.languages.map((lang, index) => (
                        <option key={index} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={`flex flex-col w-full mb-2 form-filed `}>
                  <h4 className="mb-2">Voice</h4>

                  <div className="flex w-full">
                    <select
                      name="voice"
                      value={selectedVoice}
                      onChange={handleChangeVoice}
                      className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[13px] ${
                        inputValue.voice.trim()
                          ? "border-primary font-montserrat font-medium"
                          : "border-grey500 bg-[rgb(130,130,130)]"
                      } focus:outline-none focus:border-primary transition`}
                    >
                      <option value="" disabled>
                        Select Voice
                      </option>
                      {configureData.voices.map((voice, index) => (
                        <option key={index} value={voice}>
                          {voice}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={`flex flex-col w-full mb-2 form-filed `}>
                  <h4 className="mb-2">Region</h4>

                  <div className="flex w-full">
                    <select
                      name="region"
                      value={selectedRegion}
                      onChange={handleChangeRegion}
                      className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[13px] ${
                        inputValue.region.trim()
                          ? "border-primary font-montserrat font-medium"
                          : "border-grey500 bg-[rgb(130,130,130)]"
                      } focus:outline-none focus:border-primary transition`}
                    >
                      <option value="" disabled>
                        Select Region
                      </option>
                      {configureData.regions.map((region, index) => (
                        <option key={index} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`flex flex-col w-full mb-2 form-filed `}>
                    <h4 className="mb-2">Voice Pitch</h4>
                    <div className="flex w-full">
                      <input
                        type="text"
                        name="vPitch"
                        value={inputValue.vPitch}
                        onChange={handleInputChange}
                        placeholder="0-100"
                        className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                          inputValue.vPitch.trim()
                            ? "border-primary  font-montserrat font-medium"
                            : "border-grey500 bg-[rgb(130,130,130)]"
                        } focus:outline-none focus:border-primary transition`}
                      />
                    </div>
                  </div>
                  <div className={`flex flex-col w-full mb-2 form-filed `}>
                    <h4 className="mb-2">Voice Rate</h4>
                    <div className="flex w-full">
                      <input
                        type="text"
                        name="vRate"
                        value={inputValue.vRate}
                        onChange={handleInputChange}
                        placeholder="0-100"
                        className={`w-full h-12 bg-[rgb(89,89,89)] border rounded-md p-[14px] ${
                          inputValue.vRate.trim()
                            ? "border-primary  font-montserrat font-medium"
                            : "border-grey500 bg-[rgb(130,130,130)]"
                        } focus:outline-none focus:border-primary transition`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-8 mb-5 justify-center items-center">
            <Button type="submit" className="btn btn-gradient-blue ">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AddPersonalityModal;
