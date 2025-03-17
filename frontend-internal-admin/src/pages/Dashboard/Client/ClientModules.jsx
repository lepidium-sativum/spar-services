import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { MantineProvider } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { getClientModules } from "../../../../store/thunk/commonThunk";
import SparLoader from "../../../component/Loader/SparLoader";
import assets from "../../../constants/assets";
import SystemPromptModal from "../../../component/Modal/SystemPromptModal";
import AnalysisPromptModal from "../../../component/Modal/AnalysisPromptModal";
import Button from "../../../component/Button/Button";

const ClientModules = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const clientId = location.state?.clientId;
  const clientName = location.state?.name;
  // console.log("client name: ", clientName);
  const isLoader = useSelector((state) => state.commonReducer.loader);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowSelection, setRowSelection] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  // const [data, setData] = useState(clientList);
  const [clientModulesData, setClientModulesData] = useState("");
  const [originalModules, setOriginalModules] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  // Analysis Propmt
  const [showModal, setShowModal] = useState(false);
  const [analysisPrompt, setAnalysisPrompt] = useState("");

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Name",
      },

      {
        id: "system_prompt",
        header: "Sytem Prompt",
        columnDefType: "display", //turns off data column features like sorting, filtering, etc.
        enableColumnOrdering: true, //but you can turn back any of those features on if you want like this
        Cell: ({ row }) => (
          <span
            onClick={() => handleOpenPrompt(row?.original?.system_prompt)}
            className=" underline cursor-pointer"
          >
            Link
          </span>
        ),
      },
      {
        id: "analysis_prompt",
        header: "Analysis Prompt",
        columnDefType: "display", //turns off data column features like sorting, filtering, etc.
        enableColumnOrdering: true, //but you can turn back any of those features on if you want like this
        Cell: ({ row }) => {
          return (
            <>
              {row?.original?.objectives &&
                row?.original?.objectives.map((obj, index) => (
                  <div key={index}>
                    <span
                      onClick={() => handleAnalysisPrompt(obj?.analysis_prompt)}
                      className="underline cursor-pointer"
                    >
                      {obj?.title}
                    </span>
                  </div>
                ))}
            </>
          );
        },
      },
      // {
      //   id: "unassign",
      //   header: " Unassign",
      //   columnDefType: "display", //turns off data column features like sorting, filtering, etc.
      //   enableColumnOrdering: true, //but you can turn back any of those features on if you want like this
      //   Cell: ({ row }) => (
      //     <span
      //       onClick={() => handleunassign(row?.original?.id)}
      //       className=" underline cursor-pointer"
      //     >
      //       Unassign
      //     </span>
      //   ),
      // },
    ],
    []
  );
  // const handleunassign = (data) => {
  //   const confirmDelete = window.confirm(`Are you sure to Unassign ${data}?`);

  //   if (confirmDelete) {
  //     // setAllUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  //     alert("under working");
  //   } else {
  //     alert("Deletion canceled");
  //   }
  // };
  const handleAssign = () => {
    if (selectedRow.length === 0) {
      alert("Please select at least one module to assign.");
    } else {
      const confirmUnassign = window.confirm(
        `Are you sure you want to unassign the row with ID ${selectedModuleIds}?`
      );

      if (confirmUnassign) {
        alert("under working");
      } else {
        alert("unassign canceled");
      }
    }
  };
  const handleOpenPrompt = (data) => {
    // console.log("Opening modal with conversation: ", data); // Add this log to debug
    setPrompt(data);
    setIsOpenModal(true);
  };
  const handleAnalysisPrompt = (data) => {
    if (!data || (typeof data === "string" && data.trim() === "")) {
      alert("Analysis not available");
    } else {
      setAnalysisPrompt(data);
      setShowModal(true);
    }
  };
  useEffect(() => {
    // console.log("clientModulesData ", clientModulesData);
    if (clientId) {
      dispatch(getClientModules(clientId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            const data = response?.payload?.data;
            const modules = data.flatMap((client) => client.modules);
            setClientModulesData(modules);
            setOriginalModules(modules);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [clientId, dispatch, location]);

  const onSearchHandler = (data) => {
    if (data.trim() === "") {
      setClientModulesData(originalModules);
    } else {
      const resultData = originalModules.filter((item) => {
        return Object.keys(item).some((key) => {
          if (typeof item[key] === "string") {
            return item[key].toLowerCase().includes(data.toLowerCase());
          }
          return false;
        });
      });
      setClientModulesData(resultData);
    }
  };

  const onChangeHandler = (event) => {
    setSearchTerm(event.target.value);
    onSearchHandler(event.target.value);
  };
  console.log("clientModulesData: ", clientModulesData);

  const table = useMantineReactTable({
    columns,
    data: clientModulesData || [],
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id, // Define how to get row ID
  });

  useEffect(() => {
    // console.log("module selection: ", rowSelection);
    const selectedRowKeys = Object.keys(rowSelection);
    // console.log("selectedRowKeys: ", selectedRowKeys);
    // console.log("modules: ", selectedRowKeys);
    const selectedData = selectedRowKeys.map((key) => {
      const moduleId = parseInt(key, 10);
      return clientModulesData.find((module) => module.id === moduleId);
    });
    const AllIds = selectedData.map((data) => data.id);
    // console.log("Mapped selectedData: ", selectedData);
    // console.log("All ids: ", AllIds);
    setSelectedModuleIds(AllIds);
    setSelectedRow(selectedData);
  }, [rowSelection]);

  // console.log("abc", rowSelection);
  return (
    <>
      {isLoader ? (
        <SparLoader />
      ) : (
        <div className=" h-full overflow-auto flex flex-col text-red-50 w-full">
          <div className={`form-filed mb-0 justify-between flex flex-row`}>
            <div className="flex flex-row">
              <img
                src={assets.back}
                alt="Go Back"
                className="w-[30px] h-[30px] mt-2"
                onClick={() => navigate(-1)}
              />
              <h4 className=" text-base font-bold font-montserrat mt-3 ml-10 text-black tracking-[0.24px]">
                Modules Assigned for ({clientName})
              </h4>
            </div>

            <div className="relative text-center w-full max-w-[600px] ">
              <input
                value={searchTerm}
                onChange={onChangeHandler}
                type="text"
                name="search"
                placeholder="Search"
                className={`w-full m-auto h-12 bg-transparent border border-grey500 rounded-xl p-[14px] focus:outline-none focus:border-primary transition placeholder-placeholder text-black`}
              />
            </div>
            {/* <div className="flex mr-4 justify-end"> */}
            {/* <Button
                onClick={() => setOpenModal(true)}
                className="btn btn-gradient-Blue"
              >
                Manage Modules
              </Button> */}
            {/* <Button onClick={handleAssign} className="btn-gradient-blue ">
                Unassign
              </Button> */}
            {/* </div> */}
          </div>
          {clientModulesData && clientModulesData.length > 0 ? (
            <div className="mt-14">
              <MantineProvider>
                <MantineReactTable
                  table={table}
                  mantineTableBodyRowProps={({ row }) => ({
                    onClick: row.getToggleSelectedHandler(),
                    sx: {
                      cursor: "pointer",
                    },
                  })}
                />
                {/* <MantineReactTable
                  data={table}
                  enableTopToolbar={true}
                  enableBottomToolbar={false}
                  enableRowSelection={false}
                  enablePinning={true}
                  // mantineTableBodyRowProps={{
                  //   onClick: () => {
                  //     navigate("/clientModuleDetail");
                  //   },
                  // }}
                /> */}
              </MantineProvider>
            </div>
          ) : (
            <div className="custom-box h-[calc(100vh-310px)] mt-14 bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] flex justify-center items-center">
              <div className="text-center flex flex-col justify-center items-center p-6">
                {!originalModules?.length ? (
                  <>
                    <p className="primary font-bold text-[19px] mb-2">
                      No Module Assigned yet...
                    </p>
                    <span className="text-white mb-8">
                      Start by assigning Module by clicking on the button below
                    </span>
                    <Button
                      onClick={() => navigate("/all-modules")}
                      className="btn btn-gradient "
                    >
                      Assign Modules
                    </Button>
                  </>
                ) : (
                  <p className="primary font-bold text-[19px] mb-2">
                    No Result Found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {isOpenModal && (
        <SystemPromptModal
          onClose={() => setIsOpenModal(false)}
          data={prompt}
        />
      )}
      {showModal && (
        <AnalysisPromptModal
          onClose={() => setShowModal(false)}
          data={analysisPrompt}
        />
      )}
    </>
  );
};

export default ClientModules;
