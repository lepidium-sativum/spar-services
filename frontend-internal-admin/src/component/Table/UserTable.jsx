import React, { useEffect, useState, useMemo, useRef } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { MantineProvider, Menu } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const UserTable = ({
  data,
  customClass,
  selectedModuleIds,
  handleAssignData,
}) => {
  const dispatch = useDispatch();
  let navigate = useNavigate();

  const clientUsersList = useSelector(
    (state) => state.commonReducer.clientUsersList
  );

  const [clientUsers, setClientUsers] = useState([]);
  const [userRow, setUserRow] = useState([]);
  const [userSelection, setUserSelection] = useState({});
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  // console.log("module ids on usertable: ", selectedModuleIds);
  const previousUserIdsRef = useRef([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        size: 50,
      },
      {
        accessorKey: "username",
        header: "User Name",
      },
      {
        accessorKey: "first_name",
        header: "First Name",
      },
      {
        accessorKey: "email",
        header: "email",
      },
      // {
      //   accessorKey: "location",
      //   header: "Location",
      // },
    ],
    []
  );

  useEffect(() => {
    if (data && data.users.length > 0) {
      const selectedRowKeys = Object.keys(userSelection).filter(
        (key) => userSelection[key]
      );
      const selectedData = selectedRowKeys.map((key) => {
        const row = data.users.find((row) => row.id === parseInt(key));
        return row;
      });
      const usersIds = selectedData.map((user) => user.id);
      console.log("Filtered Selected Data Array:", selectedData);
      console.log("Selected user ids of users:", usersIds);
      setSelectedUserIds(usersIds);
      setUserRow(selectedData.filter((row) => row !== undefined));
    } else {
      setUserRow([]);
    }
  }, [userSelection, data]);

  useEffect(() => {
    if (
      JSON.stringify(previousUserIdsRef.current) !==
      JSON.stringify(selectedUserIds)
    ) {
      previousUserIdsRef.current = selectedUserIds;
      if (handleAssignData) {
        handleAssignData(data.id, selectedUserIds);
      }
    }
  }, [selectedUserIds, data.id, handleAssignData]);

  const tableInstance = useMantineReactTable({
    columns: columns,
    data: data?.users || [],
    state: {
      rowSelection: userSelection,
    },
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowSelection: true, // Enable row selection
    enableMultiRowSelection: true, // Enable single row selection (radio buttons)
    enableRowActions: true,
    enableSelectAll: true,
    enableSubRowSelection: true,
    onRowSelectionChange: setUserSelection,
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item onClick={() => console.info("Delete", row.original?.id)}>
          Delete
        </Menu.Item>
      </>
    ),
    getRowId: (row) => row.id, // Define how to get row ID
    mantineTableBodyCellProps: {
      sx: {
        backgroundColor: "#928C8C",
        color: "#ffffff",
        borderBottom: "none",
      },
    },
    mantineTableProps: {
      highlightOnHover: false,
      sx: {
        borderCollapse: "collapse", // Ensure borders collapse
        "& tr": {
          borderBottom: "none", // Remove border between rows
        },
      },
    },
    mantineTableBodyRowProps: {
      sx: {
        color: "#ffffff",
        borderBottom: "none", // Remove border between rows
      },
      onClick: () => {
        navigate("/userSparDetails");
      },
    },
    mantineTableHeadCellProps: {
      sx: {
        backgroundColor: "#928C8C",
        color: "#ffffff",
        borderBottom: "none", // No border between cells
      },
    },
  });
  // useEffect(() => {
  //   console.log("User Rows State:", userRow); // Log the userRow state for debugging
  // }, [userRow]);
  return (
    <div className="customClass">
      <MantineProvider>
        <MantineReactTable
          table={tableInstance}
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
  );
};

export default UserTable;
