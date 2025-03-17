import React, { useState, useEffect, useMemo, useCallback } from "react";
import Button from "../../../component/Button/Button";
import AvatarCard from "../../../component/Avatar/AvatarCard";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../../src/utils/showToast";
import {
  getAvatars,
  getPromptTemplate,
  createModule,
  updateModule,
  getModule,
  configApi,
} from "../../../../store/thunk/commonThunk";
import Handlebars from "handlebars";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { MantineProvider, Menu } from "@mantine/core";
import AddClientModal from "../../../component/Modal/AddClientModal";
import AddConsiderationModal from "../../../component/Modal/AddConsiderationModal";
import { useNavigate, useLocation } from "react-router-dom";
import assets from "../../../constants/assets";
import _ from "lodash";
import TemplateEditor from "../../../component/Template/TemplateEditor";
import AddGreetingModal from "../../../component/Modal/AddGreetingModal";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
// import config from "../../../component/Modal/config.json";

function decodeHTMLEntities(text) {
  const parser = new DOMParser();
  const decodedString = parser.parseFromString(text, "text/html").body
    .textContent;
  return decodedString;
}
const CreateModule = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [objectiveRow, setObjectiveRow] = useState([]);
  const [considerationRow, setConsiderationRow] = useState([]);
  const [greetingRow, setGreetingRow] = useState([]);

  const [objectivesSelection, setObjectivesSelection] = useState({});
  const [considerationsSelection, setConsiderationsSelection] = useState({});
  const [greetingsSelection, setGreetingsSelection] = useState({});
  const [tags, setTags] = React.useState([]); // State to store the array of tags
  const dispatch = useDispatch();
  let navigateTo = useNavigate();
  const location = useLocation();
  const [objectives, setObjectives] = useState([]);
  const [considerations, setConsiderations] = useState([]);
  const [greetings, setGreetings] = useState([]);
  const [avatarData, setAvatarData] = useState([]);
  const [templateData, setTemplateData] = useState();
  const [filledTemplate, setFilledTemplate] = useState("");
  const [module, setModule] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState("");
  const [considerationModal, setConsiderationModal] = useState(false);
  const [greetingModal, setGreetingModal] = useState(false);
  const [level, setLevel] = React.useState("Beginner");
  const [avatar_mode, setAvatar_mode] = React.useState("Speed");
  const styleColorMap = {
    red: "#FF0000",
    blue: "#0000FF",
    green: "#008000",
    yellow: "#FFFF00",
  };
  const fontColor = _.toLower(selectedAvatar?.personality?.llm?.style);
  const difficultyLevels = ["Beginner", "Medium", "Expert"];
  const avaterModuleOptions = ["Speed", "Realism"];
  const [error, setError] = useState({
    name: "",
    what_avatar_knows: "",
    what_avatar_wants: "",
    who_avatar_speaks_with: "",
    who_avatar_accepts_refuses: "",
    session_time: "",
    user: "",
    avatar: "",
  });
  const [inputValues, setInputValues] = useState({
    name: module?.name || "",
    what_avatar_knows: module?.what_avatar_knows || "",
    what_avatar_wants: module?.what_avatar_wants || "",
    who_avatar_speaks_with: module?.who_avatar_speaks_with || "",
    who_avatar_accepts_refuses: module?.who_avatar_accepts_refuses || "",
    session_time: "",
    user: "",
    avatar: "",
  });
  const [moduleMode, setModuleMode] = useState("");

  useEffect(() => {
    const moduleId = location.state?.id;
    if (moduleId) {
      dispatch(getModule(moduleId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            const data = response?.payload?.data;
            console.log("Edit Module data:", data);
            setModule(data);
            const transformedGreetings =
              data?.scenario?.greeting_messages &&
              data?.scenario?.greeting_messages?.map((message) => ({
                greeting: message,
              }));
            setGreetings(transformedGreetings || []);
            setEditTemplate(data?.system_prompt);
            setObjectives(data?.objectives);
            setConsiderations(data?.promptconsiderations);
            setSelectedAvatar(data?.aiavatar);
            setTags(data?.stt_phrase_list || []);
            setLevel(data?.level || "");
            setAvatar_mode(data?.avatar_mode || "");
            setInputValues((prevValues) => ({
              ...prevValues,
              name: data?.name || "", // Safely update the name field from module
              what_avatar_knows: data?.scenario?.what_avatar_knows || "",
              what_avatar_wants: data?.scenario?.what_avatar_wants || "",
              who_avatar_speaks_with:
                data?.scenario?.who_avatar_speaks_with || "",
              who_avatar_accepts_refuses:
                data?.scenario?.who_avatar_accepts_refuses || "",
              session_time: data?.session_time.toString() || "",
              user: data?.scenario?.roles?.user || "",
              avatar: data?.scenario?.roles?.avatar || "",
            }));
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [dispatch, location.state?.id]);

  useEffect(() => {
    if (!module) {
      dispatch(getPromptTemplate("interaction_prompt"))
        .then((response) => {
          if (response?.payload?.status === 200) {
            const sortedData = response?.payload?.data;
            setTemplateData(sortedData);
          }
        })
        .catch((error) => {
          console.error("Error fetching Avatar data:", error);
        });
    }
  }, [dispatch, module]);

  useEffect(() => {
    if (module) {
      const decodedTemplate = decodeHTMLEntities(editTemplate);
      setEditTemplate(decodedTemplate);
    } else {
      const decodedTemplate = decodeHTMLEntities(filledTemplate);
      setFilledTemplate(decodedTemplate);
    }
  }, [editTemplate, filledTemplate, module]);
  // console.log("template edition: ", filledTemplate);

  useEffect(() => {
    dispatch(configApi());
  }, [dispatch]);

  useEffect(() => {
    const savedInputValues = localStorage.getItem("moduleInputValues");
    const savedFilledTemplate = localStorage.getItem("moduleFilledTemplate");
    const savedSelectedAvatar = localStorage.getItem("moduleSelectedAvatar");
    const savedConsideration = localStorage.getItem("moduleConsideration");
    const savedGreeting = localStorage.getItem("moduleGreeting");
    const savedAvatarMode = localStorage.getItem("avatarmode");
    const savedmoduleMode = localStorage.getItem("moduleMode");
    // Restore state from localStorage (parsing only if JSON is valid)
    try {
      if (savedInputValues) setInputValues(JSON.parse(savedInputValues));
    } catch (error) {
      console.error("Error parsing moduleInputValues:", error);
    }
    // try {
    //   if (savedPhrase) {
    //     setTags(JSON.parse(savedPhrase));
    //   }
    // } catch (error) {
    //   console.error("Error parsing modulePhrase:", error);
    // }
    if (savedFilledTemplate) setFilledTemplate(savedFilledTemplate);
    try {
      if (savedSelectedAvatar)
        setSelectedAvatar(JSON.parse(savedSelectedAvatar));
    } catch (error) {
      console.error("Error parsing moduleSelectedAvatar:", error);
    }

    try {
      if (savedConsideration)
        setConsiderations(JSON.parse(savedConsideration) || []);
    } catch (error) {
      console.error("Error parsing moduleConsideration:", error);
    }
    try {
      if (savedGreeting) setGreetings(JSON.parse(savedGreeting));
    } catch (error) {
      console.error("Error parsing moduleGreeting:", error);
    }
    try {
      if (savedAvatarMode) setAvatar_mode(JSON.parse(savedAvatarMode));
    } catch (error) {
      console.error("Error parsing avatar mode:", error);
    }
    try {
      if (savedmoduleMode) setModuleMode(JSON.parse(savedmoduleMode));
    } catch (error) {
      console.error("Error parsing avatar mode:", error);
    }

    if (location.state?.data) {
      // setObjectivesData(location.state.data);
      setObjectives(location.state?.data);
    }
  }, [location.state]);

  const handleObjective = () => {
    // Save the current state to localStorage
    try {
      localStorage.setItem("moduleMode", JSON.stringify(moduleMode));
      localStorage.setItem("avatarmode", JSON.stringify(avatar_mode));
      localStorage.setItem("moduleInputValues", JSON.stringify(inputValues));
      localStorage.setItem("moduleFilledTemplate", filledTemplate); // Only store strings directly
      localStorage.setItem(
        "moduleSelectedAvatar",
        JSON.stringify(selectedAvatar)
      );
      // localStorage.setItem("moduleObjectives", JSON.stringify(objectives));
      localStorage.setItem(
        "moduleConsideration",
        JSON.stringify(considerations)
      );
      localStorage.setItem("moduleGreeting", JSON.stringify(greetings));
      localStorage.setItem("modulePhrase", JSON.stringify(tags));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
    navigateTo("/add-objective", { state: { data: objectives } });
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("moduleInputValues");
    localStorage.removeItem("moduleFilledTemplate");
    localStorage.removeItem("moduleSelectedAvatar");
    localStorage.removeItem("moduleConsideration");
    localStorage.removeItem("moduleGreeting");
    localStorage.removeItem("modulePhrase");
    localStorage.removeItem("avatarmode");
    localStorage.removeItem("moduleMode");
  };

  useEffect(() => {
    // Check if the user comes from a page other than 'add-objective'
    if (location.state?.from !== "/add-objective") {
      clearLocalStorage();
    }
  }, [location.state?.from]); // This effect runs only once when the component is mounted

  const handleConsiderationSubmit = (newConsideration) => {
    setConsiderations((prevConsideration) => [
      ...prevConsideration,
      newConsideration,
    ]);
    setConsiderationModal(false); // Close the modal
  };
  const handleGreetingSubmit = (newGreeting) => {
    setGreetings((prevGreeting) => [...prevGreeting, newGreeting]);
    setGreetingModal(false); // Close the modal
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValues({
      ...inputValues,
      [name]: value,
    });
  };
  const handleValidation = () => {
    const newErrorsState = {};
    let formIsValid = true;
    if (!inputValues.name) {
      formIsValid = false;
      newErrorsState.name = "Module name is required!";
    } else {
      newErrorsState.name = "";
    }
    if (!inputValues.what_avatar_knows) {
      formIsValid = false;
      newErrorsState.what_avatar_knows = "This field is required!";
    } else {
      newErrorsState.what_avatar_knows = "";
    }
    if (!inputValues.what_avatar_wants) {
      formIsValid = false;
      newErrorsState.what_avatar_wants = "This field is required!";
    } else {
      newErrorsState.what_avatar_wants = "";
    }
    if (!inputValues.who_avatar_speaks_with) {
      formIsValid = false;
      newErrorsState.who_avatar_speaks_with = "This field is required!";
    } else {
      newErrorsState.who_avatar_speaks_with = "";
    }
    if (!inputValues.who_avatar_accepts_refuses) {
      formIsValid = false;
      newErrorsState.who_avatar_accepts_refuses = "This field is required!";
    } else {
      newErrorsState.who_avatar_accepts_refuses = "";
    }
    if (!inputValues.user) {
      formIsValid = false;
      newErrorsState.user = "This field is required!";
    } else {
      newErrorsState.user = "";
    }
    if (!inputValues.avatar) {
      formIsValid = false;
      newErrorsState.avatar = "This field is required!";
    } else {
      newErrorsState.avatar = "";
    }
    if (!selectedAvatar) {
      formIsValid = false;
      newErrorsState.row = "This field is required!";
    } else {
      newErrorsState.row = "";
    }
    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Required fields are empty", "error");
      return false;
    }

    const scenario = {
      who_avatar_speaks_with: inputValues.who_avatar_speaks_with || "",
      what_avatar_wants: inputValues.what_avatar_wants || "",
      what_avatar_knows: inputValues.what_avatar_knows || "",
      who_avatar_accepts_refuses: inputValues.who_avatar_accepts_refuses || "",
      greeting_messages: greetingRow && greetingRow.map((i) => i.greeting),
      initial_emotion: moduleMode,
      roles: {
        user: inputValues.user,
        avatar: inputValues.avatar,
      },
    };
    const transformedData = objectives.map((item) => ({
      title: item.title,
      description: item.description,
      expanded_objective: item.expanded_objective,
      analysis_prompt: item.analysis_prompt,
    }));
    let data = {
      name: inputValues.name,
      scenario: scenario,
      objectives: transformedData,
      considerations: considerationRow,
      avatar_id: selectedAvatar.id,
      system_prompt: filledTemplate,
      session_time: inputValues.session_time,
      level,
      avatar_mode,
      stt_phrase_list: tags,
      moduleMode,
    };
    // console.log("all module data: ", data);
    dispatch(createModule(data))
      .then((res) => {
        if (res?.payload?.status === 200) {
          console.log("Module created successful");
          setError({});
          navigateTo("/all-modules");
        } else if (res?.payload) {
          console.log("error in Module: ", res?.payload);
        }
      })
      .catch((error) => {
        console.log("Create Module error response", error);
      });
    setError(newErrorsState);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleValidation();
    localStorage.removeItem("moduleInputValues");
    localStorage.removeItem("moduleFilledTemplate");
    localStorage.removeItem("moduleSelectedAvatar");
    localStorage.removeItem("moduleConsideration");
    localStorage.removeItem("moduleGreeting");
    localStorage.removeItem("modulePhrase");
  };
  const handleUpdateValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    if (!inputValues.name) {
      formIsValid = false;
      newErrorsState.name = "Module name is required!";
    } else {
      newErrorsState.name = "";
    }
    if (!inputValues.what_avatar_knows) {
      formIsValid = false;
      newErrorsState.what_avatar_knows = "This field is required!";
    } else {
      newErrorsState.what_avatar_knows = "";
    }
    if (!inputValues.what_avatar_wants) {
      formIsValid = false;
      newErrorsState.what_avatar_wants = "This field is required!";
    } else {
      newErrorsState.what_avatar_wants = "";
    }
    if (!inputValues.who_avatar_speaks_with) {
      formIsValid = false;
      newErrorsState.who_avatar_speaks_with = "This field is required!";
    } else {
      newErrorsState.who_avatar_speaks_with = "";
    }
    if (!inputValues.who_avatar_accepts_refuses) {
      formIsValid = false;
      newErrorsState.who_avatar_accepts_refuses = "This field is required!";
    } else {
      newErrorsState.who_avatar_accepts_refuses = "";
    }
    if (!inputValues.user) {
      formIsValid = false;
      newErrorsState.user = "This field is required!";
    } else {
      newErrorsState.user = "";
    }
    if (!inputValues.avatar) {
      formIsValid = false;
      newErrorsState.avatar = "This field is required!";
    } else {
      newErrorsState.avatar = "";
    }
    if (!selectedAvatar) {
      formIsValid = false;
      newErrorsState.row = "This field is required!";
    } else {
      newErrorsState.row = "";
    }
    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Filled required field");
      return false;
    }

    const scenario = {
      who_avatar_speaks_with: inputValues.who_avatar_speaks_with || "",
      what_avatar_wants: inputValues.what_avatar_wants || "",
      what_avatar_knows: inputValues.what_avatar_knows || "",
      who_avatar_accepts_refuses: inputValues.who_avatar_accepts_refuses || "",
      initial_emotion: moduleMode,
      greeting_messages: greetingRow && greetingRow.map((i) => i.greeting),
      roles: {
        user: inputValues.user,
        avatar: inputValues.avatar,
      },
    };
    const transformedData = objectives.map((item) => ({
      title: item.title,
      description: item.description,
      expanded_objective: item.expanded_objective,
      analysis_prompt: item.analysis_prompt,
    }));
    let data = {
      module_id: module?.id,
      name: inputValues.name,
      scenario: scenario,
      objectives: transformedData,
      considerations: considerationRow,
      avatar_id: selectedAvatar.id,
      system_prompt: editTemplate,
      session_time: inputValues.session_time,
      level,
      avatar_mode,
      stt_phrase_list: tags,
      moduleMode,
    };
    console.log("update module data: ", data);
    dispatch(updateModule(data))
      .then((res) => {
        if (res?.payload?.status === 200) {
          console.log("Module updated successfully");
          setError({});
          navigateTo("/all-modules");
        } else if (res?.payload) {
          console.log("error in Module: ", res?.payload);
        }
      })
      .catch((error) => {
        console.log("Create Module error response", error);
      });
    setError(newErrorsState);
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    handleUpdateValidation();
  };
  const handleDelete = useCallback(
    (indexToDelete) => {
      const updatedObjectives = objectives.filter(
        (_, index) => index !== indexToDelete
      );
      setObjectives(updatedObjectives);
    },
    [objectives]
  );
  // const objectiveColumns = useMemo(
  //   () => [
  //     {
  //       accessorKey: "title",
  //       header: "Title",
  //     },
  //     {
  //       accessorKey: "description",
  //       header: "Description",
  //     },
  //     {
  //       accessorKey: "delete",
  //       header: "Delete",
  //       Cell: ({ row }) => {
  //         {
  //           console.log("Row", row);
  //         }
  //         return (
  //           <img
  //             src={assets.trashBlack}
  //             alt=""
  //             className="cursor-pointer"
  //             onClick={() => handleDelete(row.index)}
  //           />
  //         );
  //       },
  //     },
  //   ],
  //   []
  // );

  const objectiveColumns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "delete",
        header: "Delete",
        Cell: ({ row }) => (
          <img
            src={assets.trashBlack}
            alt=""
            className="cursor-pointer"
            onClick={() => handleDelete(row.index)}
          />
        ),
      },
    ],
    [handleDelete]
  );
  const considerationColumns = useMemo(
    () => [
      {
        accessorKey: "consideration",
        header: "Consideration",
      },
    ],
    []
  );
  const greetingColumns = useMemo(
    () => [
      {
        accessorKey: "greeting",
        header: "Greetings",
      },
    ],
    []
  );

  useEffect(() => {
    dispatch(getAvatars())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const sortedData = response?.payload?.data;
          setAvatarData(sortedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching Avatar data:", error);
      });
  }, [dispatch, location]);
  useEffect(() => {
    const style = selectedAvatar?.personality?.llm?.style;
    if (style === "RED") {
      setLevel("Expert");
    } else if (style === "GREEN") {
      setLevel("Beginner");
    } else if (style === "YELLOW" || style === "BLUE") {
      setLevel("Medium");
    } else {
      setLevel("Beginner");
    }
  }, [selectedAvatar]);
  const handleAvatarClick = (avatar) => {
    setSelectedAvatar(avatar);
  };

  useEffect(() => {
    const selectedRowKeys = Object.keys(objectivesSelection);
    const selectedData = selectedRowKeys.map((key) => {
      const index = parseInt(key, 10);
      const objective = objectives[index];
      return objective;
    });
    // console.log("Mapped selectedData: ", selectedData);
    setObjectiveRow(selectedData);
  }, [objectivesSelection, objectives]);

  useEffect(() => {
    const selectedRowKeys = Object.keys(considerationsSelection);
    const selectedData = selectedRowKeys.map((key) => {
      const index = parseInt(key, 10);
      const consideration = considerations[index];
      // console.log(
      //   `Mapping key ${key} to consideration at index ${index}: `,
      //   consideration
      // );
      return consideration;
    });
    setConsiderationRow(selectedData);
    // console.log("Selected Considerations Data:", selectedData);
  }, [considerationsSelection, considerations]);
  useEffect(() => {
    const selectedRowKeys = Object.keys(greetingsSelection);
    const selectedData = selectedRowKeys.map((key) => {
      const index = parseInt(key, 10);
      const greeting = greetings[index];
      // console.log(
      //   `Mapping key ${key} to objective at index ${index}: `,
      //   greeting
      // );
      return greeting;
    });
    setGreetingRow(selectedData);
    // console.log("Selected Considerations Data:", selectedData);
  }, [greetingsSelection, greetings]);
  const objectiveInstance = useMantineReactTable({
    columns: objectiveColumns,
    data: objectives || [],
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowSelection: false, // Enable row selection
    enableMultiRowSelection: false, // Enable single row selection (radio buttons)
    enableRowActions: false,
  });

  const considerationInstance = useMantineReactTable({
    columns: considerationColumns,
    data: considerations || [],
    state: {
      rowSelection: considerationsSelection,
    },
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowSelection: true, // Enable row selection
    enableMultiRowSelection: true, // Enable single row selection (radio buttons)
    onRowSelectionChange: setConsiderationsSelection,
    enableRowActions: false,
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item
          onClick={() =>
            console.info("Delete Consideration", row.original?.consideration)
          }
        >
          Delete
        </Menu.Item>
      </>
    ),
    getRowId: (row, index) => index.toString(), // Use index as row ID
  });
  const greetingsInstance = useMantineReactTable({
    columns: greetingColumns,
    data: greetings || [],
    state: {
      rowSelection: greetingsSelection,
    },
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowSelection: true, // Enable row selection
    enableMultiRowSelection: true, // Enable single row selection (radio buttons)
    onRowSelectionChange: setGreetingsSelection,
    enableRowActions: false,
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item
          onClick={() =>
            console.info("Delete greetings", row.original?.greeting)
          }
        >
          Delete
        </Menu.Item>
      </>
    ),
    getRowId: (row, index) => index.toString(), // Use index as row ID
  });
  useEffect(() => {
    const module = {
      avatar: {
        name: selectedAvatar?.name || "Metahuman",
        metahuman: {
          age: selectedAvatar?.metahuman?.age || 30,
          gender: selectedAvatar?.metahuman?.gender || "male",
        },
        personality: {
          personality_info: selectedAvatar?.personality?.personality_info,
        },
        bgscene: { name: selectedAvatar?.bgscene?.name },
      },
      scenario: {
        who_avatar_speaks_with: inputValues.who_avatar_speaks_with || "",
        what_avatar_wants: inputValues.what_avatar_wants || "",
        what_avatar_knows: inputValues.what_avatar_knows || "",
        what_avatar_accepts_refuses:
          inputValues.who_avatar_accepts_refuses || "",
      },
    };
    // console.log("Template Module:", templateData?.template);

    if (templateData?.template) {
      try {
        const compiledTemplate = Handlebars.compile(templateData.template);
        let data = _.omit(templateData, ["template"]);
        data = _.extend(data, { module });
        let consideration = {
          additional_considerations:
            considerationRow && considerationRow[0]?.consideration,
        };
        data = _.extend(data, consideration);
        // console.log("final data:", data);
        const filled = compiledTemplate(data);
        setFilledTemplate(filled);
      } catch (error) {
        console.error("Error compiling template:", error);
      }
    } else {
      // console.error("Template data is missing or incomplete.");
    }
  }, [selectedAvatar, inputValues, templateData, considerationRow]);

  const handleChange = (event) => {
    setLevel(event.target.value);
  };
  const avaterModuleChanges = (event) => {
    setAvatar_mode(event.target.value);
  };
  // console.log("radio value: ", value);
  const handleTagsChange = (event, newValue) => {
    setTags(newValue); // Update tags array when user adds/removes a tag
  };

  const handleModeInput = (e) => {
    const selectedMode = e.target.value;
    setModuleMode(selectedMode);
  };
  const configureData = useSelector((state) => state.commonReducer.configData);

  return (
    <div className="flex flex-col ml-0  bg-white w-auto">
      <div className="flex flex-col self-start ml-8 ">
        <div className="flex flex-row justify-start items-baseline w-3/4 ">
          <img
            src={assets.back}
            alt="Go Back"
            className="w-[25px] h-[25px]"
            onClick={() => navigateTo("/all-modules")}
          />
          <h2 className="text-lg mt-0 font-bold ml-5">
            {module ? `Update module ${module?.id}` : "Create a new module"}
          </h2>
        </div>
        <div className="mt-4 text-sm leading-5 text-gray-500">
          Pick or create an avatar, then fill the information needed
        </div>
      </div>

      <div className="mt-5 w-full bg-gray-200 border-2 border-gray-200 border-solid min-h-[2px] max-md:max-w-full" />
      <div className="shrink-0 self-end mt-3.5 mr-80 max-w-full h-px bg-white border border-white border-solid w-[454px] max-md:mr-2.5" />
      <div className="flex flex-col pr-3.5 pl-10 w-full max-md:pl-5 max-md:max-w-full">
        <div className="flex flex-row w-full">
          <div className="flex flex-col w-1/2 mr-8 ">
            <div className="flex flex-col w-full mb-2 form-filed">
              <div>
                <h4 className="mb-2">Module name</h4>
                <div className={`flex w-full ${error.name ? "error" : ""}`}>
                  <input
                    type="text"
                    name="name"
                    value={inputValues.name}
                    onChange={handleInputChange}
                    placeholder="Name of the Module"
                    className={`w-full h-12 bg-white border rounded-md p-[14px] ${
                      inputValues.name.trim()
                        ? "border-primary  font-montserrat font-medium"
                        : "border-grey500"
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

              <div className="mt-14">
                <span className="font-montserrat font-normal mb-1">
                  Module common words
                </span>
                <Stack spacing={3} sx={{ width: "99%", marginTop: "0px" }}>
                  <Autocomplete
                    multiple
                    id="tags-filled"
                    options={[]} // Pass an empty array to options as it is mandatory
                    freeSolo // Allows freeform user input (custom tags)
                    value={tags} // Bind tags array to the value
                    onChange={handleTagsChange} // Handle changes to update the array
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            variant="outlined"
                            label={option}
                            key={key}
                            {...tagProps}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="filled"
                        // label="Enter phrase"
                        placeholder="Type and press Enter"
                        sx={{
                          // Set background color to white in all states
                          "& .MuiFilledInput-root": {
                            backgroundColor: "white",
                            // Remove the default hover and focus background color
                            "&:hover": {
                              backgroundColor: "white",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                            },
                            "&.Mui-disabled": {
                              backgroundColor: "#f5f5f5", // Optional: set a different color when disabled
                            },
                          },
                          // Add margin after the label
                          "& .MuiInputLabel-root": {
                            marginBottom: "8px", // Adjust the value as needed
                          },
                          // Adjust the position and style of the label when focused
                          "& .MuiInputLabel-root.Mui-focused": {
                            marginBottom: "8px",
                          },
                          // "& .MuiFilledInput-input": {
                          //   paddingTop: "16px", // Adjust the top padding
                          // },
                        }}
                      />
                    )}
                  />
                </Stack>
              </div>
            </div>
            <div className="flex flex-row">
              <div className="flex flex-col w-full mt-8 ">
                <div className="w-11/12  relative p-2 border border-gray-700 rounded-md mt-4 mr-2 ">
                  <h4 className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-2 text-lg whitespace-nowrap">
                    Difficulty level
                  </h4>
                  <div className={`font-montserrat text-base mt-2 `}>
                    Avatar has selected style{" "}
                    <span
                      style={{
                        color: styleColorMap[fontColor] || "black", // fallback to black if undefined
                      }}
                    >
                      {selectedAvatar?.personality?.llm?.style}
                    </span>
                  </div>
                  <div>
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={level}
                        onChange={handleChange}
                      >
                        {difficultyLevels.map((level) => (
                          <FormControlLabel
                            key={level}
                            value={level}
                            control={<Radio />}
                            label={level}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </div>
                </div>
                <div className=" border border-gray-700 w-11/12 pb-4 rounded-md relative p-2 mt-4 ">
                  <div className="flex flex-col w-11/12 mt-4 ml-4 form-filed ">
                    <h4 className="mb-0"> User role</h4>
                    <div className={`relative ${error.user ? "error" : ""} `}>
                      <input
                        type="text"
                        name="user"
                        value={inputValues.user}
                        onChange={handleInputChange}
                        placeholder="User role"
                        className={`w-full h-12 bg-white border rounded-md p-[14px] mt-1 ${
                          inputValues.user.trim()
                            ? "border-primary  font-montserrat font-medium"
                            : "border-[#000000] bg-bgInput"
                        } focus:outline-none focus:border-primary transition`}
                      />
                    </div>
                    {error.user ? (
                      <p className="error text-left text-error font-normal text-xs mt-1">
                        {error.user}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="flex flex-col w-11/12 mt-4 ml-4 form-filed">
                    <h4 className="mb-0"> Avatar role</h4>
                    <div className={`relative  ${error.avatar ? "error" : ""}`}>
                      <input
                        type="text"
                        name="avatar"
                        value={inputValues.avatar}
                        onChange={handleInputChange}
                        placeholder="Avatar role"
                        className={`w-full h-12 bg-white border rounded-md p-[14px] mt-1 ${
                          inputValues.avatar.trim()
                            ? "border-primary  font-montserrat font-medium"
                            : "border-[#000000] bg-bgInput"
                        } focus:outline-none focus:border-primary transition`}
                      />
                    </div>
                    {error.avatar ? (
                      <p className="error text-left text-error font-normal text-xs mt-1">
                        {error.avatar}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="w-full  relative p-2 border border-gray-700 rounded-md mt-12">
                  <h4 className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-lg whitespace-nowrap">
                    Avater mode
                  </h4>
                  <div className={`font-montserrat text-base mr-8 mt-2 `}>
                    Do you want the avatar to be optamized for:
                  </div>

                  <div>
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={avatar_mode}
                        onChange={avaterModuleChanges}
                      >
                        {avaterModuleOptions.map((level) => (
                          <FormControlLabel
                            key={level}
                            value={level}
                            control={<Radio />}
                            label={level}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </div>
                </div>

                <div className="  w-full h-24 relative p-2 border border-gray-700 rounded-md mt-8 ">
                  <h4 className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-2 text-lg whitespace-nowrap">
                    Session timing
                  </h4>
                  <div>
                    <div
                      className={`flex flex-col w-full mb-0 form-filed ${
                        error.session_time ? "error" : ""
                      }`}
                    >
                      <h4 className="mb-2">Module time</h4>
                      <div className="flex w-full">
                        <input
                          type="text"
                          name="session_time"
                          value={inputValues.session_time}
                          onChange={handleInputChange}
                          placeholder="0 - 600 seconds"
                          className={`w-full h-10 bg-white border rounded-md p-[12px] ${
                            inputValues.session_time.trim()
                              ? "border-primary  font-montserrat font-medium"
                              : "border-grey500"
                          } focus:outline-none focus:border-primary transition`}
                        />
                      </div>
                      {error.session_time ? (
                        <p className="error text-left text-error font-normal text-xs mt-1">
                          {error.session_time}
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex w-full border-grey500 rounded-md mt-6  ${
                    error.name ? "error" : ""
                  }`}
                >
                  <select
                    name="moduleMode"
                    value={moduleMode}
                    onChange={handleModeInput}
                    className={`w-full h-12  border rounded-md p-[14px] ${
                      moduleMode.trim()
                        ? "border-primary  font-montserrat font-medium "
                        : " border  border-grey500 "
                    } focus:outline-none focus:border-primary transition`}
                  >
                    <option value="" disabled>
                      Select module mode
                    </option>
                    {configureData?.emotions?.length > 0 ? (
                      configureData.emotions.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))
                    ) : (
                      <option disabled>No emotions available</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-5 flex-col  max-md:flex-wrap w-1/2 mt-7 pt-6 pr-6 pl-6 border-2 border-[#EAECF0] border-solid rounded-xl">
            <div className="flex self-stretch w-full max-md:flex-wrap ">
              <div className="flex flex-auto justify-start mt-3 text-base font-semibold leading-3 text-stone-900">
                Select one avatar only to proceed
              </div>
              <div>
                <Button
                  onClick={() => navigateTo("/createAvatar")}
                  className="btn-gradient-white "
                >
                  &#x2A01; Add AI Avatar
                </Button>
              </div>
            </div>
            <div className="flex flex-col overflow-y-auto items-center  bg-white h-[70vh] w-full hide-scrollbar">
              <div className="mt-5 grid grid-cols-3 gap-5">
                {avatarData &&
                  avatarData.map((avatar, index) => (
                    <AvatarCard
                      key={index}
                      avatar={avatar}
                      onClick={handleAvatarClick}
                      isSelected={
                        selectedAvatar && selectedAvatar.id === avatar.id
                      }
                    />
                  ))}
              </div>
            </div>
            <div>
              {error.row ? (
                <p className="error text-left text-error font-normal text-xs ">
                  {error.row}
                </p>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        <div className="mt-7 max-md:max-w-full h-full">
          <div
            className={`flex ${
              module ? "gap-5" : "gap-0"
            } max-md:flex-col max-md:gap-0`}
          >
            <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full">
              <div className="flex flex-col grow px-8 pt-10 pb-20 w-full bg-white rounded-xl border-2 border-gray-200 border-solid max-md:px-5 max-md:mt-10 max-md:max-w-full">
                <div className="text-xl font-semibold leading-3 text-stone-900 max-md:max-w-full">
                  Scenario
                </div>
                <div className={`flex flex-col w-full mt-6 form-filed`}>
                  <h4 className="mb-0"> What the avatar Knows</h4>
                  <div
                    className={`relative  ${
                      error.what_avatar_knows ? "error" : ""
                    } `}
                  >
                    <input
                      type="text"
                      name="what_avatar_knows"
                      value={inputValues.what_avatar_knows}
                      onChange={handleInputChange}
                      placeholder="What avatar knows?"
                      className={`w-full h-16 bg-white border rounded-e-md p-[14px] mt-2 ${
                        inputValues.what_avatar_knows.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-[#EAECF0] bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.what_avatar_knows ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.what_avatar_knows}
                    </p>
                  ) : (
                    ""
                  )}
                </div>

                <div className="flex flex-col w-full mt-4 form-filed ">
                  <h4 className="mb-0 ">What the avatar wants</h4>

                  <div
                    className={`relative ${
                      error.what_avatar_wants ? "error" : ""
                    }`}
                  >
                    <input
                      type="text"
                      name="what_avatar_wants"
                      value={inputValues.what_avatar_wants}
                      onChange={handleInputChange}
                      placeholder="Avatar Wants"
                      className={`w-full h-16 bg-white border rounded-e-md p-[14px] mt-1 ${
                        inputValues.what_avatar_wants.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-[#EAECF0] bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.what_avatar_wants ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.what_avatar_wants}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex flex-col w-full mt-4 form-filed">
                  <h4 className="mb-2"> Who avatar speaks with</h4>
                  <div
                    className={`relative ${
                      error.who_avatar_speaks_with ? "error" : ""
                    }`}
                  >
                    <input
                      type="text"
                      name="who_avatar_speaks_with"
                      value={inputValues.who_avatar_speaks_with}
                      onChange={handleInputChange}
                      placeholder="Avatar speaks"
                      className={`w-full h-16 bg-white border rounded-e-md p-[14px] mt-1 ${
                        inputValues.who_avatar_speaks_with.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-[#EAECF0] bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.who_avatar_speaks_with ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.who_avatar_speaks_with}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex flex-col w-full mt-4 form-filed">
                  <h4 className="mb-0"> What the avatar accepts and refuses</h4>
                  <div
                    className={`relative ${
                      error.who_avatar_accepts_refuses ? "error" : ""
                    } `}
                  >
                    <input
                      type="text"
                      name="who_avatar_accepts_refuses"
                      value={inputValues.who_avatar_accepts_refuses}
                      onChange={handleInputChange}
                      placeholder=""
                      className={`w-full h-16 bg-white border rounded-e-md p-[14px] mt-1 ${
                        inputValues.who_avatar_accepts_refuses.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-[#EAECF0] bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.who_avatar_accepts_refuses ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.who_avatar_accepts_refuses}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
                {/* <div className="flex flex-col w-full mt-4 form-filed ">
                  <h4 className="mb-0"> User role</h4>
                  <div className={`relative ${error.user ? "error" : ""} `}>
                    <input
                      type="text"
                      name="user"
                      value={inputValues.user}
                      onChange={handleInputChange}
                      placeholder="User role"
                      className={`w-full h-16 bg-white border rounded-e-md p-[14px] mt-1 ${
                        inputValues.user.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-[#EAECF0] bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.user ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.user}
                    </p>
                  ) : (
                    ""
                  )}
                </div> */}
                {/* <div className="flex flex-col w-full mt-4 form-filed">
                  <h4 className="mb-0"> Avatar role</h4>
                  <div className={`relative  ${error.avatar ? "error" : ""}`}>
                    <input
                      type="text"
                      name="avatar"
                      value={inputValues.avatar}
                      onChange={handleInputChange}
                      placeholder="Avatar role"
                      className={`w-full h-16 bg-white border rounded-e-md p-[14px] mt-1 ${
                        inputValues.avatar.trim()
                          ? "border-primary  font-montserrat font-medium"
                          : "border-[#EAECF0] bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  {error.avatar ? (
                    <p className="error text-left text-error font-normal text-xs mt-1">
                      {error.avatar}
                    </p>
                  ) : (
                    ""
                  )}
                </div> */}
                <div className="flex flex-col gap-5 justify-between items-start mt-5 w-full max-md:flex-wrap max-md:pr-5 max-md:mt-5 max-md:max-w-full">
                  <div className="flex flex-row w-full justify-between ">
                    <div className="mt-5 text-lg font-semibold leading-3 text-black">
                      Objectives
                    </div>
                    <div>
                      <Button
                        onClick={handleObjective}
                        className="btn-gradient-blue-round "
                      >
                        &#x2A01; Add Objective
                      </Button>
                    </div>
                  </div>
                  <div className="mt-5 w-full">
                    <MantineProvider>
                      <MantineReactTable
                        table={objectiveInstance}
                        enableRowSelection={false}
                        positionToolbarAlertBanner={"none"} //hide alert banner selection message
                      />
                    </MantineProvider>
                  </div>
                </div>

                <div className="flex flex-col gap-5 justify-between items-start mt-5 w-full max-md:flex-wrap max-md:pr-5 max-md:mt-10 max-md:max-w-full">
                  <div className="flex flex-row w-full justify-between ">
                    <div className="mt-5 text-lg font-semibold leading-3 text-black">
                      Important Considerations
                    </div>
                    <div>
                      <Button
                        onClick={() => setConsiderationModal(true)}
                        className="btn-gradient-blue-round "
                      >
                        &#x2A01; Add Consideration
                      </Button>
                    </div>
                  </div>
                  <div className="mt-5 w-full">
                    <MantineProvider>
                      <MantineReactTable
                        table={considerationInstance}
                        positionToolbarAlertBanner={"none"} //hide alert banner selection message
                        mantineTableBodyRowProps={({ row }) => ({
                          onClick: row.getToggleSelectedHandler(),
                          sx: {
                            cursor: "pointer",
                          },
                        })}
                      />
                    </MantineProvider>
                  </div>
                </div>
                {/* Greetings */}
                <div className="flex flex-col gap-5 justify-between items-start mt-5 w-full max-md:flex-wrap max-md:pr-5 max-md:mt-10 max-md:max-w-full">
                  <div className="flex flex-row w-full justify-between ">
                    <div className="mt-5 text-lg font-semibold leading-3 text-black">
                      Greetings
                    </div>
                    <div>
                      <Button
                        onClick={() => setGreetingModal(true)}
                        className="btn-gradient-blue-round "
                      >
                        &#x2A01; Add greetings
                      </Button>
                    </div>
                  </div>
                  <div className="mt-5 w-full">
                    <MantineProvider>
                      <MantineReactTable
                        table={greetingsInstance}
                        positionToolbarAlertBanner={"none"} //hide alert banner selection message
                        mantineTableBodyRowProps={({ row }) => ({
                          onClick: row.getToggleSelectedHandler(),
                          sx: {
                            cursor: "pointer",
                          },
                        })}
                      />
                    </MantineProvider>
                  </div>
                </div>
              </div>
            </div>

            <div
              // className={`flex flex-col ${
              //   module ? "ml-0 h-[700px]" : "ml-5"
              // } w-6/12 max-md:ml-0 max-md:w-full`}
              className={`flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full`}
            >
              <div className="grow justify-center px-6 py-4 w-full text-base font-semibold leading-6 text-gray-500 bg-white rounded-xl border-2 border-gray-200 border-solid max-md:px-5 max-md:mt-10 max-md:max-w-full">
                <TemplateEditor
                  value={module ? editTemplate : filledTemplate}
                  onChange={module ? setEditTemplate : setFilledTemplate}
                />
              </div>
            </div>
          </div>
        </div>
        {!module && (
          <div className={"flex flex-col justify-center items-center mt-10"}>
            <Button
              onClick={handleSubmit}
              className=" btn-gradient-blue w-44 text-xl "
            >
              Save
            </Button>
          </div>
        )}
      </div>
      {module && (
        <div className={"flex justify-center items-center mt-10"}>
          <Button
            onClick={handleUpdate}
            className=" btn-gradient-blue w-44 text-xl"
          >
            Update
          </Button>
        </div>
      )}
      {openModal && <AddClientModal onClose={() => setOpenModal(false)} />}
      {considerationModal && (
        <AddConsiderationModal
          onClose={() => setConsiderationModal(false)}
          onSubmit={handleConsiderationSubmit}
        />
      )}
      {greetingModal && (
        <AddGreetingModal
          onClose={() => setGreetingModal(false)}
          onSubmit={handleGreetingSubmit}
        />
      )}
    </div>
  );
};

export default CreateModule;
