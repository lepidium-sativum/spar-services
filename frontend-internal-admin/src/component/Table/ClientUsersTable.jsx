import React, { useMemo } from "react";
import { getColumnNames } from "../../utils/constant";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { MantineProvider } from "@mantine/core";
import assets from "../../constants/assets";
import { Link, useNavigate } from "react-router-dom";
import _ from "lodash";
import "./table.css";

const ClientUsersTable = ({ data, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Id",
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
        accessorKey: "last_name",
        header: "Last Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
      },
      {
        accessorKey: "first_name",
        header: "Modules",
        enableColumnOrdering: true,

        Cell: ({ row }) => (
          <>
            <div
              onClick={() =>
                handleNavigate(row.original.id, row.original.first_name)
              }
              className="cursor-pointer hover:underline active:text-primary"
            >
              module{" "}
            </div>
          </>
        ),
      },
      {
        accessorKey: "delete",
        header: "Delete",
        enableColumnOrdering: true,

        Cell: ({ row }) => (
          <>
            <div onClick={() => onDelete(row.original.id)}>
              <img
                src={assets.trashBlack}
                alt="My Image"
                className="active:text-red-600"
              />
            </div>
          </>
        ),
      },
    ],
    []
  );
  const table = useMantineReactTable({
    columns,
    data: data || [],
    // enableTopToolbar: true,
    // enableBottomToolbar: true,
    // enableRowSelection: true,
    // enableMultiRowSelection: true,
    // state: {
    //   rowSelection,
    // },
    // onRowSelectionChange: setRowSelection,
    // getRowId: (row) => row.id, // Define how to get row ID
  });
  const handleNavigate = (id, name) => {
    navigate("/userModules", { state: { userId: id, name } });
  };
  return (
    <div className="relative overflow-x-scroll shadow-md sm:rounded-lg mt-16">
      <div className="hide-scroll">
        {data && (
          <MantineProvider>
            <MantineReactTable
              table={table}
              enableTopToolbar={true}
              enableTableHead={true}
            />
          </MantineProvider>
        )}
      </div>
    </div>
  );
};

export default ClientUsersTable;
