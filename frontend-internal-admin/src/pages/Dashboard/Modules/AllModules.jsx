import React, { useMemo, useState, useEffect } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { MantineProvider } from "@mantine/core";
import Button from "../../../component/Button/Button";
import SparLoader from "../../../component/Loader/SparLoader";
import { useDispatch, useSelector } from "react-redux";
import { getModules, deleteModule } from "../../../../store/thunk/commonThunk";
import assets from "../../../constants/assets";
import { useNavigate, useLocation } from "react-router-dom";

const AllModules = () => {
  const isLoader = useSelector((state) => state.commonReducer.loader);
  const dispatch = useDispatch();
  let navigateTo = useNavigate();
  const location = useLocation();
  const moduleList = useSelector((state) => state.commonReducer.moduleList);

  const [searchTerm, setSearchTerm] = useState("");
  const [moduleData, setModuleData] = useState();
  const [originalModule, setOriginalModule] = useState();
  const [selectedRow, setSelectedRow] = useState(null);
  const [rowSelection, setRowSelection] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Module Name",
      },
      {
        accessorKey: "moduleDescription",
        header: "Module Description",
      },
    ],
    []
  );

  useEffect(() => {
    dispatch(getModules())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const sortedData = response?.payload?.data;
          // console.log(sortedData);
          setModuleData(sortedData);
          setOriginalModule(sortedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  const onSearchHandler = (data) => {
    if (data.trim() === "") {
      setModuleData(originalModule);
    } else {
      const resultData = originalModule.filter((item) => {
        return Object.keys(item).some((key) => {
          if (typeof item[key] === "string") {
            return item[key].toLowerCase().includes(data.toLowerCase());
          }
          return false;
        });
      });
      setModuleData(resultData);
    }
  };

  const onChangeHandler = (event) => {
    setSearchTerm(event.target.value);
    onSearchHandler(event.target.value);
  };

  useEffect(() => {
    // console.log("module selection: ", rowSelection);
    const selectedRowKeys = Object.keys(rowSelection);
    // console.log("selectedRowKeys: ", selectedRowKeys);
    // console.log("modules: ", selectedRowKeys);
    const selectedData = selectedRowKeys.map((key) => {
      const moduleId = parseInt(key, 10);
      return moduleData.find((module) => module.id === moduleId);
    });
    const AllIds = selectedData.map((data) => data.id);
    // console.log("Mapped selectedData: ", selectedData);
    // console.log("All ids: ", AllIds);
    setSelectedModuleIds(AllIds);
    setSelectedRow(selectedData);
  }, [rowSelection, moduleData]);

  const table = useMantineReactTable({
    columns,
    data: moduleData || [],
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

  const handleDelete = async () => {
    if (selectedRow.length === 1) {
      const row = selectedRow[0];
      // console.log("rowid: ", selectedRowId);
      const { name } = row;
      const alertMessage = `Are you sure you want to delete the module "${name}"?`;
      const alertTitle = "Delete Confirmation"; // Custom title

      if (window.confirm(`${alertTitle}\n\n${alertMessage}`)) {
        try {
          await dispatch(deleteModule(row.id));
          // Re-fetch data after deletion
          dispatch(getModules())
            .then((response) => {
              if (response?.payload?.status === 200) {
                const sortedData = response?.payload?.data;
                setModuleData(sortedData);
                setOriginalModule(sortedData);
                setRowSelection([]);
              }
            })
            .catch((error) => {
              console.error("Error fetching data:", error);
            });
        } catch (error) {
          console.error("Error deleting module:", error);
        }
      }
    } else {
      alert("Please select exactly one row to delete.");
    }
  };

  // console.log("allmodules: ", moduleData);
  const handleAssign = () => {
    if (selectedRow.length === 0) {
      alert("Please select at least one module to assign.");
    } else {
      navigateTo("/assign-modules", {
        state: { selectedModuleIds, assignValue: true },
      });
    }
  };
  const handleUnAssign = () => {
    if (selectedRow.length === 0) {
      alert("Please select at least one module to unassign.");
    } else {
      navigateTo("/assign-modules", {
        state: { selectedModuleIds, assignValue: false },
      });
    }
  };
  const handleEdit = () => {
    const row = selectedRow[0];
    if (selectedModuleIds.length === 1) {
      navigateTo("/create-module", { state: { id: row?.id } });
    } else {
      alert("Please select at least one module to edit.");
    }
  };
  return (
    <>
      {isLoader ? (
        <SparLoader />
      ) : (
        <div className=" h-full overflow-auto flex flex-col text-red-50 w-full">
          <h2 className=" text-3xl font-bold text-black mb-4 tracking-[0.24px]">
            List of available Modules
          </h2>

          <div className={`form-filed mb-3 flex flex-row`}>
            <div className=" w-1/2">
              <div className="relative text-center w-3/4 max-w-[600px] ">
                <input
                  value={searchTerm}
                  onChange={onChangeHandler}
                  type="text"
                  name="search"
                  placeholder="Search"
                  className={`w-full m-auto h-12 bg-transparent border border-grey500 rounded-3xl p-[14px] focus:outline-none focus:border-primary transition placeholder-placeholder text-black`}
                />
              </div>
            </div>

            <div className="w-1/2 justify-end flex flex-row">
              <div className="">
                <Button onClick={handleEdit} className="btn-gradient-Blue ">
                  Edit Module
                </Button>
              </div>
              <div className="">
                <Button
                  onClick={() => navigateTo("/create-module")}
                  className="btn-gradient-Blue "
                >
                  Create Module
                </Button>
              </div>
              <div className="">
                <Button
                  type="button" // Changed type to "button"
                  className=" btn-gradient-blue font-medium whitespace-nowraptext-white flex flex-row"
                  onClick={handleDelete}
                >
                  <img src={assets.trash} alt="" className="cursor-pointer" />
                  <h6 className="text-white mt-1">Delete</h6>
                </Button>
              </div>
              <Button onClick={handleAssign} className="btn-gradient-blue ">
                Assign
              </Button>
              {/* <Button onClick={handleUnAssign} className="btn-gradient-blue ">
                Unassign
              </Button> */}
            </div>
          </div>
          {moduleData && moduleData.length ? (
            <div>
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
              </MantineProvider>
            </div>
          ) : (
            <div className="custom-box h-[calc(100vh-310px)] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] flex justify-center items-center">
              <div className="text-center flex flex-col justify-center items-center p-6">
                {!originalModule?.length ? (
                  <>
                    <p className="primary font-bold text-[19px] mb-2">
                      No Module created yet...
                    </p>
                    <span className="text-white mb-8">
                      Start by creating a Module by clicking on the button below
                    </span>
                    <Button
                      // onClick={() => setShowModal(true)}
                      className="btn btn-gradient "
                    >
                      Create a Module
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
    </>
  );
};

export default AllModules;
