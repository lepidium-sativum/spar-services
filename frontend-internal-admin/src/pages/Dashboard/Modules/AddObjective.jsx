import React, { useState, useEffect, useMemo } from "react";
import Button from "../../../component/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  getPromptTemplate,
  createExpandedObjective,
} from "../../../../store/thunk/commonThunk";
import { setLoader } from "../../../../store/slices/commonSlice";
import Handlebars from "handlebars";
import { useNavigate, useLocation } from "react-router-dom";
import assets from "../../../constants/assets";
import _ from "lodash";
import ScaleLoader from "react-spinners/ScaleLoader";
import TemplateEditor from "../../../component/Template/TemplateEditor";
import { showToast } from "../../../../src/utils/showToast";

// function to decode
function decodeHTMLEntities(text) {
  const parser = new DOMParser();
  const tempText = text
    .replace(/<bold>/g, "__BOLD_START__")
    .replace(/<\/bold>/g, "__BOLD_END__");
  const decodedString = parser.parseFromString(tempText, "text/html").body
    .textContent;
  const finalText = decodedString
    .replace(/__BOLD_START__/g, "<bold>")
    .replace(/__BOLD_END__/g, "</bold>");
  return finalText;
}

const AddObjective = () => {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();
  const location = useLocation();
  const isLoader = useSelector((state) => state.commonReducer.loader);

  const existingObjectives = location.state?.data || [];
  const [templateData, setTemplateData] = useState();
  const [filledTemplate, setFilledTemplate] = useState("");
  const [filledApiTemplate, setFilledApiTemplate] = useState("");

  const [expandedObjective, setExpandedObjective] = useState("");
  const [error, setError] = useState({
    title: "",
    description: "",
    expandedObjective: "",
  });
  const [inputValues, setInputValues] = useState({
    title: "",
    description: "",
  });
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues({
      ...inputValues,
      [name]: value,
    });
  };
  // console.log("Existing obj: ", existingObjectives);
  const handleValidation = () => {
    const newErrorsState = {};
    let formIsValid = true;
    if (expandedObjective === "") {
      formIsValid = false;
      newErrorsState.expandedObjective = "Expended field is required!";
    } else {
      newErrorsState.expandedObjective = "";
    }

    if (formIsValid == false) {
      alert("Fill required fields!");
      setError(newErrorsState);
      showToast("Expended field is required!", "error");
      return false;
    }
    let objective = {
      title: inputValues.title,
      description: inputValues.description,
      expanded_objective: expandedObjective,
      analysis_prompt: filledTemplate,
    };
    const updatedObjectives = [...existingObjectives, objective];
    navigateTo("/create-module", { state: { data: updatedObjectives } });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleValidation();
  };
  useEffect(() => {
    dispatch(getPromptTemplate("coach_assessor_prompt"))
      .then((response) => {
        if (response?.payload?.status === 200) {
          dispatch(setLoader(false));
          const sortedData = response?.payload?.data;
          setTemplateData(sortedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching Avatar data:", error);
      });
  }, [dispatch]);
  useEffect(() => {
    // console.log("Api Template:", templateData?.template);
    if (templateData?.template) {
      try {
        Handlebars.registerHelper("employee_name", function () {
          return "{{employee_name}}";
        });
        const compiledTemplate = Handlebars.compile(templateData?.template);

        let data = _.omit(templateData, ["template"]);
        let objective;
        if (expandedObjective) {
          objective = { how_to_assess_objective: expandedObjective };
        }
        data = _.extend(data, objective);
        // let name = {
        //   employee_name: "",
        // };
        // data = _.extend(data, name);
        const filled = compiledTemplate(data);
        setFilledApiTemplate(filled);
      } catch (error) {
        console.error("Error compiling template:", error);
      }
    } else {
      // console.error("Template data is missing or incomplete.");
    }
  }, [expandedObjective, inputValues, templateData]);
  // deconding
  useEffect(() => {
    const decodedTemplate = decodeHTMLEntities(filledApiTemplate);
    setFilledTemplate(decodedTemplate);
  }, [filledApiTemplate]);

  const handleExpandValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    if (!inputValues.title) {
      formIsValid = false;
      newErrorsState.title = "Objective title is required!";
    } else {
      newErrorsState.title = "";
    }
    if (!inputValues.description) {
      formIsValid = false;
      newErrorsState.description = "Description is required!";
    } else {
      newErrorsState.description = "";
    }

    if (formIsValid == false) {
      // alert("Fill required fields!");
      setError(newErrorsState);
      showToast("Required fields are empty", "error");
      return false;
    }

    let data = {
      title: inputValues.title,
      description: inputValues.description,
    };
    dispatch(createExpandedObjective(data))
      .then((res) => {
        if (res?.payload?.status === 200) {
          // console.log("Expanded successful", res?.payload?.data);
          dispatch(setLoader(false));
          setError(res?.payload?.data);
          setExpandedObjective(res?.payload?.data);
        } else if (res?.payload) {
          console.log("error in Module: ", res?.payload);
        }
      })
      .catch((error) => {
        console.log("Create Module error response", error);
      });
    setError(newErrorsState);
  };

  const handleExpendedSubmit = (e) => {
    e.preventDefault();
    handleExpandValidation();
  };

  return (
    <div className="flex flex-col ml-0  bg-white w-auto">
      <div className="flex flex-col self-start ml-8 ">
        <div className="flex flex-row justify-start items-baseline w-3/4 ">
          <img
            src={assets.back}
            alt="Go Back"
            className="w-[25px] h-[25px]"
            onClick={() => navigateTo(-1)}
          />
          <h2 className="text-lg mt-0 font-bold ml-5">Objective</h2>
        </div>
      </div>
      <div className="mt-5 w-full bg-gray-200 border-2 border-gray-200 border-solid min-h-[2px] max-md:max-w-full" />
      <div className="shrink-0 self-end mt-3.5 mr-80 max-w-full h-px bg-white border border-white border-solid w-[454px] max-md:mr-2.5" />
      <div className="flex flex-col pr-3.5 pl-14 w-full max-md:pl-5 max-md:max-w-full">
        <div className="mt-2 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col max-md:gap-0">
            <div className="flex flex-col w-3/5 max-md:ml-0 max-md:w-full">
              <div className="flex flex-col grow px-8 w-full max-md:px-5 max-md:mt-10 max-md:max-w-full">
                <div className={"flex flex-col w-full mt-0 form-filed"}>
                  <h4 className="text-[15px] font-montserrat font-semibold leading-[12.9px] mb-2">
                    Objective title
                  </h4>
                  <div className={`relative ${error.title ? "error" : ""}`}>
                    <input
                      type="text"
                      name="title"
                      value={inputValues.title}
                      onChange={handleInputChange}
                      placeholder="Be Polite and respectful"
                      className={`w-full h-16 bg-white border rounded-e-md p-[14px] mt-2 ${
                        inputValues.title.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-[#EAECF0] bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.title ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.title}
                    </p>
                  ) : (
                    ""
                  )}
                </div>

                <div className="flex flex-col w-full mt-4 form-filed ">
                  <h4 className="text-[15px] font-montserrat font-semibold leading-[12.9px] mb-2">
                    Objective description
                  </h4>

                  <div
                    className={`relative ${error.description ? "error" : ""}`}
                  >
                    <input
                      type="text"
                      name="description"
                      value={inputValues.description}
                      onChange={handleInputChange}
                      placeholder="The user should always speak with the client politely and with respect"
                      className={`w-full h-16 bg-white border rounded-e-md p-[14px] mt-1 ${
                        inputValues.description.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-[#EAECF0] bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.description ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.description}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex flex-row justify-between  items-center">
                  <div className="flex flex-col w-full mt-4 form-filed">
                    <h4 className="text-[15px] font-montserrat font-semibold leading-[12.9px] mb-2">
                      Detailed expandedObjective (Expended version)
                    </h4>

                    <div
                      className={`relative ${
                        error.expandedObjective ? "error" : ""
                      } `}
                    >
                      <textarea
                        name="expandedObjective"
                        placeholder={
                          "The user should speak clearly with the client and in polite words, user must always respect the client, and shouldn’t interrupt the client when speaking.\r\nUser should always respond quickly etc..."
                        }
                        value={expandedObjective}
                        onChange={(event) =>
                          setExpandedObjective(event.target.value)
                        }
                        rows={10}
                        cols={20}
                        className={`w-11/12 h-full bg-white border rounded-md p-[14px] mt-1 custom-scrollbar ${
                          expandedObjective
                            ? "border-primary font-montserrat font-medium"
                            : "border-[#EAECF0] bg-bgInput"
                        } focus:outline-none focus:border-primary transition`}
                      />
                    </div>

                    {error.expandedObjective ? (
                      <p className="error text-left text-error font-normal text-xs mt-1">
                        {error.expandedObjective}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                    <Button
                      onClick={handleExpendedSubmit}
                      className=" btn-gradient-blue "
                    >
                      {isLoader ? (
                        <ScaleLoader
                          color={"#f9f9f9"}
                          loading={isLoader}
                          cssOverride={{
                            display: "block",
                            margin: "0 auto",
                            borderColor: "black",
                            // borderWidth: "1px",
                          }}
                          // size={8}
                          height={20}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      ) : (
                        "Expand"
                      )}
                    </Button>
                  </div>
                </div>

                {/* <div
                  className={"flex flex-col justify-center items-center mt-5"}
                >
                  <Button
                    // onClick={handleSubmit}
                    className=" btn-gradient-blue-round-sm "
                  >
                    Approve
                  </Button>
                </div> */}
                <div
                  className={"flex flex-col justify-center items-center mt-40"}
                >
                  <Button
                    onClick={handleSubmit}
                    className=" btn-gradient-blue-round-lg "
                  >
                    Save and close
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col ml-5 w-2/5 max-md:ml-0 max-md:w-full">
              <div className="grow justify-center px-6 py-4 w-full text-base font-semibold leading-6 text-gray-500 bg-white rounded-xl border-2 border-gray-200 border-solid max-md:px-5 max-md:mt-10 max-md:max-w-full">
                <TemplateEditor
                  value={filledTemplate}
                  onChange={setFilledTemplate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddObjective;
