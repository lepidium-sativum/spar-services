import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import assets from "../../../constants/assets";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { MantineProvider, Menu } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllClientUsers,
  assignModules,
} from "../../../../store/thunk/commonThunk";
import { useNavigate, useLocation } from "react-router-dom";
import UserTable from "../../../component/Table/UserTable";
import Button from "../../../component/Button/Button";
import { setLoader } from "../../../../store/slices/commonSlice";
// import { log } from "handlebars/runtime";

const AssignModules = () => {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();
  const location = useLocation();
  const { selectedModuleIds, assignValue } = location.state || {};
  const allClientUsersList = useSelector(
    (state) => state.commonReducer.allClientUsersList
  );
  const [allClientsUsers, setAllClientsUsers] = useState("");
  const [selectedClientsUsers, setSelectedClientsUsers] = useState("");
  const [clientUsersData, setClientUsersData] = useState([]);
  const [payload, setPayload] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const previousUserIdsRef = useRef({});

  // console.log("Clients and Users redux: ", allClientUsersList);
  // console.log("Users23: ", selectedModuleIds, assignValue);
  // console.log("all ids: ", selectedModuleIds);
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Client Name",
      },
      {
        accessorKey: "company",
        header: "Company",
      },
      {
        accessorKey: "domain",
        header: "Domain",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "locations.country",
        header: "Country",
      },
      {
        accessorKey: "locations.city",
        header: "City",
      },
      // {
      //   accessorKey: "description",
      //   header: "Description",
      // },
      // {
      //   accessorKey: "moduleAssigned",
      //   header: "Module Assigned",
      // },
      // {
      //   accessorKey: "users",
      //   header: "Users",
      // },
    ],
    []
  );

  useEffect(() => {
    // const clientId = "123";
    // console.log("clientId: ", clientId);
    setLoader(true);
    dispatch(getAllClientUsers())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const data = response?.payload?.data;
          // const allUsers = data.flatMap((client) => client.users);
          // console.log("allusers: ", allUsers);

          setAllClientsUsers(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  useEffect(() => {
    // const clientId = "123";
    // console.log("clientId: ", clientId);
    setLoader(true);
    dispatch(getAllClientUsers())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const data = response?.payload?.data;
          // const allUsers = data.flatMap((client) => client.users);
          // console.log("allusers: ", allUsers);

          setSelectedClientsUsers(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  const handleAssignData = useCallback((client_id, userIds) => {
    console.log("clientid: ", client_id);
    setAssignees((prevAssignees) => {
      // Filter out the assignee if userIds is empty
      const updatedAssignees = prevAssignees.filter(
        (assignee) => assignee.client_id !== client_id
      );

      if (userIds.length > 0) {
        return [...updatedAssignees, { client_id, user_ids: userIds }];
      }

      return updatedAssignees;
    });
  }, []);

  const tableInstance = useMantineReactTable({
    columns: columns,
    data: allClientsUsers || [],
    enableRowSelection: false, // Enable row selection
    enableMultiRowSelection: false, // Enable single row selection (radio buttons)
    enableRowActions: false,
    enableExpanding: true, // Enable row expansion
    enableSelectAll: true,
    enableSubRowSelection: true,
    renderDetailPanel: ({ row }) => (
      <div>
        {/* {console.log(
          "client: ",
          allClientsUsers.find((user) => user.id === row.original?.id)
        )} */}
        {row.original && (
          <UserTable
            data={
              allClientsUsers.find((user) => user.id === row.original?.id) || []
            }
            selectedModuleIds={selectedModuleIds}
            handleAssignData={handleAssignData}
            customClass="child-table"
          />
        )}
      </div>
    ),
  });

  const selectedTableInstance = useMantineReactTable({
    columns: columns,
    data: selectedClientsUsers || [],
    enableRowSelection: false, // Enable row selection
    enableMultiRowSelection: false, // Enable single row selection (radio buttons)
    enableRowActions: false,
    enableExpanding: true, // Enable row expansion
    enableSelectAll: true,
    enableSubRowSelection: true,
    renderDetailPanel: ({ row }) => (
      <div>
        {/* {console.log(
          "client: ",
          allClientsUsers.find((user) => user.id === row.original?.id)
        )} */}
        {row.original && (
          <UserTable
            data={
              selectedClientsUsers.find(
                (user) => user.id === row.original?.id
              ) || []
            }
            selectedModuleIds={selectedModuleIds}
            handleAssignData={handleAssignData}
            customClass="child-table"
          />
        )}
      </div>
    ),
  });

  const handleAssign = async () => {
    const payload = {
      assignees,
      modules: selectedModuleIds,
    };
    console.log("Payload:", payload);
    dispatch(assignModules(payload)).then((response) => {
      if (response?.payload?.status === 200) {
        navigateTo("/all-modules");
      }
    });
  };

  return (
    <div className="flex flex-col ml-0 h-screen bg-white">
      <div className="flex flex-row justify-start w-1/2">
        <img
          src={assets.back}
          alt="Go Back"
          className="w-[51px]"
          onClick={() => navigateTo(-1)}
        />
        {assignValue ? (
          <h2 className="text-sm mt-4 font-bold ml-5">Assign modules</h2>
        ) : (
          <h2 className="text-sm mt-4 font-bold ml-5">Unassign modules</h2>
        )}
      </div>
      <div className="mt-5 w-full  bg-gray-200 border-2 border-gray-200 border-solid min-h-[2px] max-md:max-w-full" />
      <div className="mt-6 h-full overflow-y-auto p-4 hide-scrollbar">
        {allClientsUsers && (
          <MantineProvider>
            <MantineReactTable
              table={assignValue ? tableInstance : selectedTableInstance}
              positionToolbarAlertBanner={"none"} // Hide alert banner selection message
            />
          </MantineProvider>
        )}
      </div>
      <div className="w-full p-4 flex justify-center border-t border-gray-200 sticky bottom-0 bg-white">
        {/* <Button
          // onClick={() => setOpenModal(true)}
          className="btn-gradient-Blue mr-5"
        >
          Send Email
        </Button> */}
        {assignValue ? (
          <Button onClick={handleAssign} className="btn-gradient-Blue mr-5">
            Assign
          </Button>
        ) : (
          <Button onClick={handleAssign} className="btn-gradient-Blue mr-5">
            Unassign
          </Button>
        )}
        {/* <Button onClick={handleAssign} className="btn-gradient-Blue mr-5">
          Assign
        </Button> */}
        <Button
          onClick={() => navigateTo(-1)}
          className="btn-gradient-Blue mr-5"
        >
          close
        </Button>
      </div>
    </div>
  );
};

export default AssignModules;
