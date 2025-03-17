import React, { useMemo, useEffect, useState } from "react";
import { MantineReactTable } from "mantine-react-table";
import { MantineProvider } from "@mantine/core";
import Button from "../../../component/Button/Button";
import SparLoader from "../../../component/Loader/SparLoader";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserModules,
  deleteSpar,
  deleteAllSpars,
} from "../../../../store/thunk/commonThunk";
import { useNavigate, useLocation } from "react-router-dom";
import UserSparTable from "../../../component/Table/UserSparTable";
import assets from "../../../constants/assets";
import SystemPromptModal from "../../../component/Modal/SystemPromptModal";

const UserModules = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const userName = location.state?.name;
  const isLoader = useSelector((state) => state.commonReducer.loader);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [userModules, setUserModules] = useState();
  const [originalModule, setOriginalModule] = useState();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [prompt, setPrompt] = useState("");

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Id",
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
        id: "delete",
        header: "Actions",
        columnDefType: "display",
        Cell: ({ row }) => (
          <button
            onClick={() => handleDeleteAllSpars(row.original.id)} // Call parent handleDelete function
            className="bg-[#0070ff] text-white px-2 py-1 rounded"
          >
            Delete All Spars
          </button>
        ),
      },
    ],
    []
  );

  const handleOpenPrompt = (data) => {
    // console.log("Opening modal with conversation: ", data); // Add this log to debug
    setPrompt(data);
    setIsOpenModal(true);
  };

  useEffect(() => {
    // console.log("userId: ", userId);
    if (userId) {
      dispatch(getUserModules(userId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            // console.log("data: ", response?.payload?.data);
            const sortedData = response?.payload?.data.map(
              (item) => item.module
            );
            setUserModules(sortedData);
            setOriginalModule(sortedData);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [userId, dispatch]);

  const onSearchHandler = (data) => {
    if (data.trim() === "") {
      setUserModules(originalModule);
    } else {
      const resultData = originalModule.filter((item) => {
        return Object.keys(item).some((key) => {
          if (typeof item[key] === "string") {
            return item[key].toLowerCase().includes(data.toLowerCase());
          }
          return false;
        });
      });
      setUserModules(resultData);
    }
  };

  const onChangeHandler = (event) => {
    setSearchTerm(event.target.value);
    onSearchHandler(event.target.value);
  };

  const handleSparDelete = async (sparId) => {
    // console.log("Deleting spar with id:", sparId);
    const alertMessage = `Are you sure you want to delete the spar?`;
    const alertTitle = "Delete Confirmation"; // Custom title
    if (window.confirm(`${alertTitle}\n\n${alertMessage}`)) {
      try {
        await dispatch(deleteSpar(sparId));

        // Re-fetch data after deletion
        dispatch(getUserModules(userId))
          .then((response) => {
            if (response?.payload?.status === 200) {
              // const sortedData = response?.payload?.data;
              const sortedData = response?.payload?.data.map(
                (item) => item.module
              );
              setUserModules(sortedData);
              setOriginalModule(sortedData);
            }
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      } catch (error) {
        console.error("Error deleting spar:", error);
      }
    }
  };
  const handleDeleteAllSpars = async (moduleId) => {
    // console.log("Deleting spar with id:", sparId);
    const alertMessage = `Are you sure you want to delete all the spars?`;
    const alertTitle = "Delete Confirmation"; // Custom title
    if (window.confirm(`${alertTitle}\n\n${alertMessage}`)) {
      try {
        await dispatch(deleteAllSpars(moduleId));

        // Re-fetch data after deletion
        dispatch(getUserModules(userId))
          .then((response) => {
            if (response?.payload?.status === 200) {
              // const sortedData = response?.payload?.data;
              const sortedData = response?.payload?.data.map(
                (item) => item.module
              );
              setUserModules(sortedData);
              setOriginalModule(sortedData);
            }
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      } catch (error) {
        console.error("Error deleting spar:", error);
      }
    }
  };
  return (
    <>
      {isLoader ? (
        <SparLoader />
      ) : (
        <div className="h-full overflow-auto flex flex-col text-red-50 w-full">
          <div className={`form-filed mb-3 justify-between flex flex-row`}>
            <div className="flex flex-row justify-between w-3/4">
              <div className="flex flex-row justify-start">
                <img
                  src={assets.back}
                  alt="Go Back"
                  className="w-[30px] h-[30px] mt-2"
                  onClick={() => navigate(-1)}
                />
                <h2 className=" text-2xl ml-6 font-semibold text-black mb-0 mt-2 tracking-[0.24px]">
                  {userName}
                </h2>
              </div>
              <div className="relative text-center w-3/4 max-w-[600px] ">
                <input
                  value={searchTerm}
                  onChange={onChangeHandler}
                  type="text"
                  name="search"
                  placeholder="Search"
                  className={`w-full m-auto h-12 bg-transparent border border-grey500 rounded-xl p-[14px] focus:outline-none focus:border-primary transition placeholder-placeholder text-black`}
                />
              </div>
            </div>
          </div>
          {userModules && userModules.length ? (
            <div>
              <MantineProvider>
                <MantineReactTable
                  columns={columns}
                  data={userModules}
                  enableTopToolbar={false}
                  enableBottomToolbar={false}
                  // enableRowSelection={true}
                  enablePinning={true}
                  // enableExpanding={false}
                  mantineTableBodyProps={{
                    sx: () => ({
                      "& tr:nth-of-type(4n+3)": {
                        backgroundColor: "limegreen",
                      },
                    }),
                  }}
                  mantineTableBodyCellProps={{
                    sx: {
                      border: "none",
                    },
                  }}
                  renderDetailPanel={({ row }) => (
                    <div>
                      {/* {console.log("row data: ", row.original)} */}
                      {row.original && (
                        <UserSparTable
                          user_id={userId}
                          data={
                            userModules.find(
                              (module) => module.id === row.original?.id
                            ) || []
                          }
                          handleDelete={handleSparDelete}
                        />
                      )}
                    </div>
                  )}
                />
              </MantineProvider>
            </div>
          ) : (
            <div className="custom-box h-[calc(100vh-310px)] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] flex justify-center items-center">
              <div className="text-center flex flex-col justify-center items-center p-6">
                {!originalModule?.length ? (
                  <>
                    <p className="primary font-bold text-[19px] mb-2">
                      No module assigned yet...
                    </p>
                    <span className="text-white mb-8">
                      Go and assign the modules
                    </span>
                    <Button
                      onClick={() => navigate("/all-modules")}
                      className="btn btn-gradient-back"
                    >
                      Assign modules
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
    </>
  );
};

export default UserModules;
