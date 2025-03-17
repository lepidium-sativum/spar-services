import React, { useMemo } from "react";
import { getColumnNames } from "../../utils/constant";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { MantineProvider } from "@mantine/core";
import Button from "../Button/Button";
import assets from "../../constants/assets";
import { Link, useNavigate } from "react-router-dom";
import _ from "lodash";
import "./table.css";
import { useDispatch } from "react-redux";
import { deleteClient } from "../../../store/thunk/commonThunk";

const ClientTable = ({ data, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
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
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "site_url",
        header: "Site Url",
      },
      {
        accessorKey: "raw_files",
        header: "Raw Files",
      },
      {
        accessorKey: "locations.country",
        header: "Country",
      },
      {
        accessorKey: "locations.city",
        header: "City",
      },
      {
        accessorKey: "locations.branch",
        header: "Branch",
      },
      {
        accessorKey: "module",
        header: "Module",
        enableColumnOrdering: true,

        Cell: ({ row }) => (
          <>
            <div
              onClick={() =>
                handleNavigate(row.original.id, row.original.company)
              }
              className="cursor-pointer hover:underline active:text-primary"
            >
              Module
            </div>
          </>
        ),
      },
      {
        accessorKey: "user",
        header: "User",
        enableColumnOrdering: true,
        Cell: ({ row }) => (
          <Link
            to={`/clientUsers?clientId=${row.original.id}`}
            className="hover:underline active:text-primary"
          >
            Click Here
          </Link>
        ),
        // Cell: ({ row }) => (
        //   <>
        //     <div
        //       onClick={() => handleUser(row.original.id)}
        //       className="cursor-pointer hover:underline active:text-primary"
        //     >
        //       Click Here
        //     </div>
        //   </>
        // ),
      },
      {
        accessorKey: "edit",
        header: "Edit",
        enableColumnOrdering: true,

        Cell: ({ row }) => (
          <div
            onClick={() => onEdit(true, row.original.id, row.original.name)}
            className="cursor-pointer hover:underline active:text-primary"
          >
            Edit
          </div>
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
    navigate("/clientModules", { state: { clientId: id, name } });
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

export default ClientTable;
// const handleDelete = (id) => {
//   if (window.confirm("Are you sure you want to delete this Client?")) {
//     dispatch(deleteClient(id))
//       .then((response) => {
//         if (response?.payload?.status === 200) {
//           console.log("Client deleted Successfully");
//         }
//       })
//       .catch((error) => {
//         console.error("Error deleting Client:", error);
//       });
//   }
// };
